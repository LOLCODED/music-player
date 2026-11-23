import Foundation

struct CarPlayItem {
    let id: String
    let kind: String
    let title: String
    let subtitle: String?
    let artworkUrl: URL?
}

struct CarPlayListResult {
    let items: [CarPlayItem]
    let emptyMessage: String?
}

// Main-thread broker between the CarPlay screen and the web app, which owns
// the library and the player.
final class CarPlayLibrary {
    static let shared = CarPlayLibrary()
    static let didBecomeReady = Notification.Name("CarPlayLibraryDidBecomeReady")

    private static let requestTimeout: TimeInterval = 15
    private static let notRespondingMessage = "Open Cascade on your iPhone"

    weak var plugin: CarPlayPlugin?
    private(set) var isReady = false
    private var pending: [String: (CarPlayListResult) -> Void] = [:]

    func markReady() {
        isReady = true
        NotificationCenter.default.post(name: Self.didBecomeReady, object: nil)
    }

    func requestList(section: String, completion: @escaping (CarPlayListResult) -> Void) {
        guard isReady, let plugin else {
            completion(CarPlayListResult(items: [], emptyMessage: Self.notRespondingMessage))
            return
        }
        let requestId = UUID().uuidString
        pending[requestId] = completion
        plugin.requestList(requestId: requestId, section: section)
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.requestTimeout) { [weak self] in
            self?.resolve(requestId: requestId, with: CarPlayListResult(items: [], emptyMessage: Self.notRespondingMessage))
        }
    }

    func resolve(requestId: String, with result: CarPlayListResult) {
        pending.removeValue(forKey: requestId)?(result)
    }

    func select(_ item: CarPlayItem) {
        plugin?.select(kind: item.kind, id: item.id)
    }
}

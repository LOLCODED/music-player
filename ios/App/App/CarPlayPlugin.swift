import Capacitor

@objc(CarPlayPlugin)
public class CarPlayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CarPlayPlugin"
    public let jsName = "CarPlay"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ready", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resolveList", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        DispatchQueue.main.async { CarPlayLibrary.shared.plugin = self }
    }

    @objc func ready(_ call: CAPPluginCall) {
        DispatchQueue.main.async { CarPlayLibrary.shared.markReady() }
        call.resolve()
    }

    @objc func resolveList(_ call: CAPPluginCall) {
        guard let requestId = call.getString("requestId") else {
            call.reject("requestId is required")
            return
        }
        let items = (call.getArray("items") ?? []).compactMap { ($0 as? JSObject).flatMap(Self.item) }
        let result = CarPlayListResult(items: items, emptyMessage: call.getString("emptyMessage"))
        DispatchQueue.main.async { CarPlayLibrary.shared.resolve(requestId: requestId, with: result) }
        call.resolve()
    }

    func requestList(requestId: String, section: String) {
        notifyListeners("listRequested", data: ["requestId": requestId, "section": section])
    }

    func select(kind: String, id: String) {
        notifyListeners("itemSelected", data: ["kind": kind, "id": id])
    }

    private static func item(from json: JSObject) -> CarPlayItem? {
        guard let id = json["id"] as? String,
              let kind = json["kind"] as? String,
              let title = json["title"] as? String else { return nil }
        return CarPlayItem(
            id: id,
            kind: kind,
            title: title,
            subtitle: json["subtitle"] as? String,
            artworkUrl: (json["artworkUrl"] as? String).flatMap(URL.init(string:))
        )
    }
}

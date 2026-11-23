import CarPlay

private enum CarPlaySection: String, CaseIterable {
    case playlists, recent, newest

    var title: String {
        switch self {
        case .playlists: return "Playlists"
        case .recent: return "Recently Played"
        case .newest: return "Recently Added"
        }
    }

    var symbol: String {
        switch self {
        case .playlists: return "music.note.list"
        case .recent: return "clock"
        case .newest: return "square.stack"
        }
    }
}

final class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate, CPTabBarTemplateDelegate {
    private var interfaceController: CPInterfaceController?
    private var readyObserver: NSObjectProtocol?
    private let artwork = CarPlayArtworkLoader()
    private var templates: [(section: CarPlaySection, list: CPListTemplate)] = []

    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                  didConnect interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController
        CascadeBridgeViewController.shared.loadViewIfNeeded()

        templates = CarPlaySection.allCases.map { ($0, Self.makeListTemplate(for: $0)) }
        let tabBar = CPTabBarTemplate(templates: templates.map(\.list))
        tabBar.delegate = self
        interfaceController.setRootTemplate(tabBar, animated: false, completion: nil)

        readyObserver = NotificationCenter.default.addObserver(
            forName: CarPlayLibrary.didBecomeReady, object: nil, queue: .main
        ) { [weak self] _ in self?.reloadAll() }
        if CarPlayLibrary.shared.isReady { reloadAll() }
    }

    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                  didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        if let readyObserver { NotificationCenter.default.removeObserver(readyObserver) }
        readyObserver = nil
        templates = []
        self.interfaceController = nil
    }

    func tabBarTemplate(_ tabBarTemplate: CPTabBarTemplate, didSelect selectedTemplate: CPTemplate) {
        guard CarPlayLibrary.shared.isReady,
              let entry = templates.first(where: { $0.list === selectedTemplate }) else { return }
        reload(entry.list, section: entry.section)
    }

    private static func makeListTemplate(for section: CarPlaySection) -> CPListTemplate {
        let list = CPListTemplate(title: section.title, sections: [])
        list.tabTitle = section.title
        list.tabImage = UIImage(systemName: section.symbol)
        list.emptyViewTitleVariants = ["Loading…"]
        return list
    }

    private func reloadAll() {
        templates.forEach { reload($0.list, section: $0.section) }
    }

    private func reload(_ list: CPListTemplate, section: CarPlaySection) {
        CarPlayLibrary.shared.requestList(section: section.rawValue) { [weak self, weak list] result in
            guard let self, let list else { return }
            list.emptyViewTitleVariants = [result.emptyMessage ?? ""]
            list.updateSections([CPListSection(items: result.items.map(self.makeListItem))])
        }
    }

    private func makeListItem(for item: CarPlayItem) -> CPListItem {
        let placeholder = UIImage(systemName: item.kind == "playlist" ? "music.note.list" : "opticaldisc")
        let listItem = CPListItem(text: item.title, detailText: item.subtitle, image: placeholder)
        listItem.handler = { [weak self] _, completion in
            CarPlayLibrary.shared.select(item)
            self?.showNowPlaying()
            completion()
        }
        if let url = item.artworkUrl {
            artwork.load(url) { [weak listItem] image in listItem?.setImage(image) }
        }
        return listItem
    }

    private func showNowPlaying() {
        guard let interfaceController,
              !(interfaceController.topTemplate is CPNowPlayingTemplate) else { return }
        interfaceController.pushTemplate(CPNowPlayingTemplate.shared, animated: true, completion: nil)
    }
}

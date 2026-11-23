import Capacitor

// The app's single web view. Whichever scene connects first (the phone window
// or CarPlay) creates it, so a CarPlay-only launch still runs the player.
final class CascadeBridgeViewController: CAPBridgeViewController {
    static let shared = CascadeBridgeViewController()

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(CarPlayPlugin())
    }
}

import UIKit
import Capacitor

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = CascadeBridgeViewController.shared
        window.makeKeyAndVisible()
        self.window = window

        connectionOptions.urlContexts.forEach(open)
        connectionOptions.userActivities.forEach(forward)
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Release the shared web view so a reconnecting scene can adopt it.
        window?.rootViewController = nil
        window = nil
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        URLContexts.forEach(open)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forward(userActivity)
    }

    private func open(_ context: UIOpenURLContext) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url)
    }

    private func forward(_ userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity) { _ in }
    }
}

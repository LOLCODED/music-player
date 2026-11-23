import UIKit
import CarPlay

final class CarPlayArtworkLoader {
    private let cache = NSCache<NSURL, UIImage>()

    func load(_ url: URL, completion: @escaping (UIImage) -> Void) {
        if let cached = cache.object(forKey: url as NSURL) {
            completion(cached)
            return
        }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            guard let data, let image = UIImage(data: data) else { return }
            let resized = Self.fit(image, in: CPListItem.maximumImageSize)
            DispatchQueue.main.async {
                self?.cache.setObject(resized, forKey: url as NSURL)
                completion(resized)
            }
        }.resume()
    }

    private static func fit(_ image: UIImage, in size: CGSize) -> UIImage {
        UIGraphicsImageRenderer(size: size).image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
}

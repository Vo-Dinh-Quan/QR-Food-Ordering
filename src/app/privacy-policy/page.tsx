export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Chính sách bảo mật
          </h1>
        </div>
      </section>
      <section className="py-12 md:py-20 lg:py-24">
        <div className="max-w-4xl space-y-10 text-muted-foreground leading-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">1. Giới thiệu</h2>
            <p>
              Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo
              mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ
              liệu cá nhân khi bạn sử dụng ứng dụng Bin Restaurant.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">2. Dữ liệu thu thập</h2>
            <p>Khi bạn đăng nhập thông qua Google, chúng tôi thu thập:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Địa chỉ email</li>
              <li>Tên hiển thị của bạn</li>
              <li>Ảnh đại diện (nếu có)</li>
            </ul>
            <p className="mt-4">
              Ngoài ra, một số thông tin kỹ thuật (như địa chỉ IP, trình duyệt)
              có thể được thu thập để cải thiện trải nghiệm người dùng.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">3. Cách sử dụng dữ liệu</h2>
            <p>Chúng tôi sử dụng dữ liệu của bạn để:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Đăng nhập và tạo tài khoản nhanh chóng bằng Google</li>
              <li>Cá nhân hóa trải nghiệm người dùng</li>
              <li>Hỗ trợ khách hàng và xử lý đơn hàng</li>
              <li>Phân tích và cải thiện hiệu suất hệ thống</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">
              4. Dữ liệu OAuth và quyền truy cập
            </h2>
            <p>
              Chúng tôi chỉ sử dụng hai quyền (scope) sau trong quá trình đăng
              nhập:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <code>https://www.googleapis.com/auth/userinfo.email</code>: Để
                lấy email người dùng
              </li>
              <li>
                <code>https://www.googleapis.com/auth/userinfo.profile</code>:
                Để lấy tên và ảnh đại diện
              </li>
            </ul>
            <p className="mt-4">
              Chúng tôi <strong>không</strong> lưu trữ các thông tin nhạy cảm
              khác và <strong>không</strong> chia sẻ dữ liệu với bên thứ ba.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">5. Bảo mật thông tin</h2>
            <p>
              Dữ liệu cá nhân được lưu trữ và bảo vệ theo các tiêu chuẩn an toàn
              hiện đại. Mọi thông tin truyền tải đều được mã hóa qua HTTPS.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">6. Quyền của bạn</h2>
            <p>
              Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của
              mình bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">7. Liên hệ</h2>
            <p>
              Mọi thắc mắc liên quan đến chính sách bảo mật, vui lòng liên hệ
              qua email:{" "}
              <a
                href="mailto:vodinhquan2707.it@gmail.com"
                className="text-primary underline">
                vodinhquan2707.it@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

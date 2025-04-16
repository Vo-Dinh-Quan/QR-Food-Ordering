export default function About() {
  return (
    <div className="flex flex-col">
      <section className="bg-secondary py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Về nhà hàng Bin Restaurant
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            Địa chỉ: Địa chỉ: Số 1, Hàn Thuyên, khu phố 6 P, Thủ Đức, Hồ Chí
            Minh
          </p>
        </div>
      </section>
      <section className="py-12 md:py-20 lg:py-24">
        <div className="max-w-4xl space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Câu chuyện của chúng tôi</h2>
            <p className="mt-4 text-muted-foreground leading-8">
              Bin Restaurant 🍕 được thành lập với sứ mệnh mang lại hương vị
              hoàng gia! Không chỉ là một nhà hàng, mà là biểu tượng của sự tinh
              tế. Chúng tôi mang đến những kiệt tác ẩm thực, nơi hương vị thượng
              lưu gặp gỡ không gian xa hoa, tạo nên trải nghiệm đẳng cấp dành
              riêng cho những thực khách sành điệu nhất.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Giá trị của chúng tôi</h2>
            <p className="mt-4 text-muted-foreground leading-8">
              Tại Bin Restaurant, chúng tôi cam kết mang đến sự hoàn hảo trong
              từng chi tiết. Nguyên liệu được chọn lọc kỹ càng từ các nhà cung
              cấp uy tín, đảm bảo sự tươi ngon và chất lượng cao nhất. Đội ngũ
              của chúng tôi luôn sáng tạo để tạo ra những món ăn không chỉ ngon
              miệng mà còn mang đậm dấu ấn nghệ thuật.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Cam kết của chúng tôi</h2>
            <p className="mt-4 text-muted-foreground leading-8">
              Chúng tôi tin rằng mỗi bữa ăn là một hành trình trải nghiệm. Đó là
              lý do tại sao chúng tôi luôn nỗ lực mang đến cho bạn một không
              gian sang trọng, dịch vụ tận tâm, và những món ăn đỉnh cao. Từ
              khoảnh khắc bạn bước vào Bin Restaurant, bạn sẽ cảm nhận được sự
              khác biệt – nơi mà mỗi chi tiết đều được chăm chút để tạo nên
              những kỷ niệm khó quên.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

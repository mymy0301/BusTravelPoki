# Nội dung bản cập nhật
- ONLY DEV
 - Sửa lại việc pack dữ liệu cho hlw

============================================================================
- OTHER
 - Chuyển 2 event dashRush và TT từ vc hiển thị cả 2 cùng lúc => ẩn một cái đi khi hết thời gian



============================================================================
- NOTE
 - Chưa làm luồng lose , reset , home trong chế độ này
 - Bổ sung thêm gói trong shop
 - Sửa lại logic nhận thưởng và hiển thị HatRace trong ingame và home
   + home => nhận thưởng thì sẽ đồng bộ trả thưởng về home
   + in_game => <hiển thị popUP nhận thưởng xong click thì ẩn đi>
 - UIChrist trong trường hợp inGame cần nhớ bổ sung thêm luồn nếu như click play mà đã hết event hatRace => thì sẽ auto chuyển dịch sang event hatRace
 - [x] Nhớ bổ sung logic trong player data load pack BlackFriday
 



============================================================================
- NOTE cũ bỏ logic ở dưới nên chỉ giữ lại note cho các version chứ ko cần làm
 - phần hiển thị người ở hàng pas hiện vẫn đang chưa đúng vẫn cái trước cái sau
 - Phần init người cho trường hợp số người ko bị thừa hiện đang chưa làm
 - logic sort cho người ít hơn số hàng đang đứng đang bị sai
 - logic xe chạy cho xe reIndeer cần bổ sung thêm nếu hết chỗ để xe thì ko đc chạy xe. nhưng nếu user unlock chỗ để xe -> phải block và cho xe reIndeer chạy ngay <hiện chưa tính đến trường hợp có 2-3 xe chạy cùng lúc nên hãy báo cho gd để sửa>
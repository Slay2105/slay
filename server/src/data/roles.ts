import { RoleDefinition } from "../types";

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    name: "Dân Làng",
    type: "Dan",
    alignment: "Thien",
    description: "Không có chức năng đặc biệt.",
    asset: "data/masoi/danlang.png"
  },
  {
    name: "Tiên Tri",
    type: "Dan",
    alignment: "Thien",
    description: "Được xem vai trò của một người chơi mỗi đêm.",
    asset: "data/masoi/tientri.png",
    tags: ["seer"]
  },
  {
    name: "Tiên Tri Tập Sự",
    type: "Dan",
    alignment: "Thien",
    description:
      "Không có chức năng cho đến khi Tiên Tri chết; lúc đó bạn sẽ trở thành Tiên Tri mới.",
    asset: "data/masoi/tientritapsu.png"
  },
  {
    name: "Thầy Bói",
    type: "Dan",
    alignment: "Thien",
    description: "Mỗi đêm xem được một người chơi thuộc phe nào.",
    asset: "data/masoi/thayboi.png",
    tags: ["information"]
  },
  {
    name: "Thám Tử",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mỗi đêm chọn 2 người chơi và biết họ có cùng phe với nhau hay không.",
    asset: "data/masoi/thamtu.png"
  },
  {
    name: "Nhà Ngoại Cảm",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mỗi đêm chọn 2 người chơi; ngày hôm sau bạn được thông báo nếu trong số đó có người đã giết ai đêm qua.",
    asset: "data/masoi/nhangoaicam.png"
  },
  {
    name: "Bác Sĩ",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mỗi đêm chọn một người để che chở, người đó sẽ không bị giết vào đêm đấy.",
    asset: "data/masoi/bacsi.png",
    tags: ["protect"]
  },
  {
    name: "Bảo Vệ",
    type: "Dan",
    alignment: "Thien",
    description:
      "Có hai mạng, mỗi đêm chọn một người để bảo vệ; khi mục tiêu bị tấn công bạn mất một mạng.",
    asset: "data/masoi/baove.png"
  },
  {
    name: "Lực Sĩ",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mỗi đêm chọn một người để bảo vệ. Nếu mục tiêu bị tấn công, không ai chết và bạn thấy vai trò kẻ tấn công nhưng sẽ chết cuối ngày hôm sau.",
    asset: "data/masoi/lucsi.png"
  },
  {
    name: "Thợ Săn Quái Thú",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Có thể đặt bẫy lên một người chơi để kích hoạt vào đêm sau. Khi sói cắn người có bẫy, sói yếu nhất sẽ chết.",
    asset: "data/masoi/thosanquaithu.png"
  },
  {
    name: "Thợ Rèn",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Có thể rèn 2 chiếc khiên và 1 thanh kiếm, mỗi đêm rèn một món và phải đưa cho người khác trước khi rèn món mới.",
    asset: "data/masoi/thoren.png"
  },
  {
    name: "Thầy Đồng",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Mỗi đêm nói chuyện với người chết và có thể hồi sinh một người trong cả ván.",
    asset: "data/masoi/thaydong.png"
  },
  {
    name: "Xạ Thủ",
    type: "Dan",
    alignment: "KhongRo",
    description: "Có hai viên đạn để bắn một người chơi bất kỳ vào ban ngày.",
    asset: "data/masoi/xathu.png"
  },
  {
    name: "Thiện Xạ",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Mỗi đêm đánh dấu một người làm mục tiêu. Ban ngày có thể giết hoặc đổi mục tiêu; nếu mục tiêu thuộc phe Dân, bạn sẽ chết.",
    asset: "data/masoi/thienxa.png"
  },
  {
    name: "Quản Ngục",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Mỗi đêm giam một người để nói chuyện. Người bị giam không dùng được kỹ năng; có thể giết họ một lần trong ván.",
    asset: "data/masoi/quannguc.png"
  },
  {
    name: "Phù Thủy",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Có hai bình thuốc: một bình cứu và một bình giết. Bình cứu chỉ dùng khi mục tiêu bị tấn công trong đêm.",
    asset: "data/masoi/phuthuy.png"
  },
  {
    name: "Mục Sư",
    type: "Dan",
    alignment: "Thien",
    description:
      "Có thể vẩy nước thánh lên một người chơi. Nếu đó là Ma Sói, họ chết; nếu không, bạn chết.",
    asset: "data/masoi/mucsu.png"
  },
  {
    name: "Kẻ Báo Thù",
    type: "Dan",
    alignment: "Thien",
    description:
      "Chọn trước một người; khi bạn bị giết, người đó sẽ chết theo.",
    asset: "data/masoi/kebaothu.png"
  },
  {
    name: "Kỹ Nữ",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mỗi đêm chọn một người để ngủ cùng. Nếu người đó bị tấn công hoặc thuộc phe Ác, bạn sẽ chết.",
    asset: "data/masoi/kynu.png"
  },
  {
    name: "Thị Trưởng",
    type: "Dan",
    alignment: "Thien",
    description:
      "Có thể tiết lộ vai trò để lá phiếu được tính gấp đôi.",
    asset: "data/masoi/thitruong.png"
  },
  {
    name: "Bà Già Khó Tính",
    type: "Dan",
    alignment: "Thien",
    description:
      "Sau đêm đầu, mỗi đêm chọn một người; sáng hôm sau người đó không thể nói chuyện hoặc bỏ phiếu.",
    asset: "data/masoi/bagiakhotin.png"
  },
  {
    name: "Hoa Bé Con",
    type: "Dan",
    alignment: "Thien",
    description:
      "Có thể bảo vệ một người chơi khỏi việc bị dân làng treo cổ.",
    asset: "data/masoi/hoabecon.png"
  },
  {
    name: "Người Yêu Hòa Bình",
    type: "Dan",
    alignment: "Thien",
    description:
      "Có thể tiết lộ vai trò để ngăn mọi người bỏ phiếu trong một ngày (một lần).",
    asset: "data/masoi/nguoiyeuhoabinh.png"
  },
  {
    name: "Cậu Bé Miệng Bự",
    type: "Dan",
    alignment: "Thien",
    description:
      "Chọn một người; khi bạn chết vai trò của người đó sẽ được tiết lộ.",
    asset: "data/masoi/caubemiengbu.png"
  },
  {
    name: "Người Khai Mệnh",
    type: "Dan",
    alignment: "KhongRo",
    description:
      "Sở hữu hai lá bài và có thể đưa cho 2 người chơi vào ban đêm; người dùng lá bài sẽ tiết lộ vai trò.",
    asset: "data/masoi/nguoikhaimenh.png"
  },
  {
    name: "Tổng Thống",
    type: "Dan",
    alignment: "Thien",
    description:
      "Mọi người biết bạn là Tổng Thống từ đầu ván. Nếu bạn chết, phe Dân thua.",
    asset: "data/masoi/tongthong.png"
  },
  {
    name: "Ma Sói",
    type: "MaSoi",
    alignment: "Ac",
    description: "Mỗi đêm cùng đồng bọn chọn một người để cắn chết.",
    asset: "data/masoi/masoi.png",
    tags: ["kill"]
  },
  {
    name: "Sói Tiên Tri",
    type: "MaSoi",
    alignment: "Ac",
    description: "Mỗi đêm xem vai trò của một người và cả bầy Sói đều biết.",
    asset: "data/masoi/soitientri.png"
  },
  {
    name: "Sói Pháp Sư",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Ban ngày yểm một người; khi bị Tiên Tri soi người đó hiện lên như Ma Sói.",
    asset: "data/masoi/soiphapsu.png"
  },
  {
    name: "Sói Trẻ",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Chọn một người sẽ chết theo bạn khi bạn bị giết.",
    asset: "data/masoi/soitre.png"
  },
  {
    name: "Sói Ác Mộng",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Hai lần trong ván, ban ngày chọn một người để họ không dùng chức năng vào ban đêm.",
    asset: "data/masoi/soiacmong.png"
  },
  {
    name: "Sói Mèo Con",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Một lần mỗi ván có thể biến một người Dân thành Ma Sói.",
    asset: "data/masoi/soimeocon.png"
  },
  {
    name: "Sói Hòa Bình",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Một lần tiết lộ vai trò của một người cho làng và ngăn bỏ phiếu ngày hôm đó.",
    asset: "data/masoi/soihoabinh.png"
  },
  {
    name: "Sói Hắc Ám",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Một lần nhân đôi số phiếu phe mình và ẩn tất cả phiếu trong ngày.",
    asset: "data/masoi/soihacam.png"
  },
  {
    name: "Sói Bảo Hộ",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Một lần bảo vệ một người khỏi bị treo cổ, kể cả chính bạn.",
    asset: "data/masoi/soibaoho.png"
  },
  {
    name: "Sói Đầu Đàn",
    type: "MaSoi",
    alignment: "KhongRo",
    description: "Ma Sói bình thường nhưng có gấp đôi phiếu bầu trong đêm.",
    asset: "data/masoi/soidaudan.png"
  },
  {
    name: "Sói Điên Cuồng",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Một lần kích hoạt trạng thái Điên Cuồng; đêm sau nếu giết người được bảo vệ thì cả người đó và người bảo vệ đều chết.",
    asset: "data/masoi/soidiencuong.png"
  },
  {
    name: "Sói Phù Thủy",
    type: "MaSoi",
    alignment: "Ac",
    description:
      "Mỗi đêm xem vai trò của một người nhưng không thể nói chuyện với Sói khác ban đêm.",
    asset: "data/masoi/soiphuthuy.png"
  },
  {
    name: "Thằng Ngố",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Nhiệm vụ là lừa dân làng treo cổ mình ban ngày để chiến thắng.",
    asset: "data/masoi/thangngo.png"
  },
  {
    name: "Thợ Săn Người",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Đầu ván chọn mục tiêu. Nếu mục tiêu bị treo cổ ban ngày, bạn thắng cùng phe Dân; nếu chết cách khác, bạn trở thành Dân Làng.",
    asset: "data/masoi/thosannguoi.png"
  },
  {
    name: "Sát Nhân Hàng Loạt",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm giết một người chơi và không thể bị Ma Sói giết.",
    asset: "data/masoi/satnhanhangloat.png"
  },
  {
    name: "Kẻ Phóng Hỏa",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm tẩm xăng tối đa 2 người hoặc đốt cháy tất cả người đã bị tẩm xăng.",
    asset: "data/masoi/kephonghoa.png"
  },
  {
    name: "Kẻ Đặt Bom",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Đặt một quả bom vào ban đêm; bom sẽ nổ vào đêm tiếp theo.",
    asset: "data/masoi/kedatbom.png"
  },
  {
    name: "Tin Tặc",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm chọn một người để xâm nhập: họ không thể nói chuyện hoặc bỏ phiếu ngày hôm sau và sẽ chết cuối ngày.",
    asset: "data/masoi/tintac.png"
  },
  {
    name: "Kẻ Ăn Thịt Người",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm có thể giết một người hoặc nhịn đói để dồn lại và giết tối đa 5 người trong một đêm.",
    asset: "data/masoi/keanthitnguoi.png"
  },
  {
    name: "Sát Nhân Ảnh Thuật",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm ngụy trang một người để Tiên Tri soi thành Sát Nhân Ảnh Thuật; có thể giết tất cả người bị dính ảo ảnh trong thảo luận.",
    asset: "data/masoi/satnhananhthuat.png"
  },
  {
    name: "Côn Đồ",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Có thể giết một người hoặc tìm Đồng Phạm bằng cách dụ dỗ vào đêm. Không thể bị Ma Sói giết.",
    asset: "data/masoi/condo.png"
  },
  {
    name: "Kẻ Đồng Phạm",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Cùng Côn Đồ giết một người mỗi đêm. Nếu phiếu bầu hòa, phiếu của bạn thắng.",
    asset: "data/masoi/kedongpham.png"
  },
  {
    name: "Giáo Chủ",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm có thể cải đạo một người để gia nhập giáo phái. Nếu bạn chết, tín đồ chết theo.",
    asset: "data/masoi/giaochu.png"
  },
  {
    name: "Xác Sống",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Mỗi đêm có thể cắn một người; người đó trở thành zombie vào cuối đêm hôm sau.",
    asset: "data/masoi/xacsong.png"
  },
  {
    name: "Nhà Giả Kim",
    type: "DocLap",
    alignment: "KhongRo",
    description:
      "Pha chế được nhiều loại thuốc đặc biệt, có thể xoay chuyển cục diện.",
    asset: "data/masoi/nhagiakim.png"
  },
  {
    name: "Bán Sói",
    type: "DoiPhe",
    alignment: "Thien",
    description:
      "Ban đầu là Dân; khi bị Ma Sói cắn sẽ trở thành Ma Sói và không thể bị Giáo Chủ đổi phe.",
    asset: "data/masoi/bansoi.png"
  },
  {
    name: "Kẻ Trộm Mộ",
    type: "DoiPhe",
    alignment: "KhongRo",
    description:
      "Chọn một người ngay từ đầu; khi họ chết bạn trộm vai trò và đổi phe vào ngày hôm sau.",
    asset: "data/masoi/ketrommo.png"
  },
  {
    name: "Thần Tình Yêu",
    type: "DoiPhe",
    alignment: "Thien",
    description:
      "Đêm đầu tiên chọn hai người trở thành cặp đôi yêu nhau; nếu cả hai sống cuối cùng sẽ thắng.",
    asset: "data/masoi/thantinhyeu.png"
  },
  {
    name: "Cặp Đôi Yêu Nhau",
    type: "DoiPhe",
    alignment: "KhongRo",
    description:
      "Hai người được ghép cặp; nếu cả hai là người cuối cùng còn sống thì cùng chiến thắng.",
    asset: "data/masoi/capdoiyeunhau.png"
  }
];

export const DEFAULT_ROLE_POOL = ROLE_DEFINITIONS.map((role) => role.name);

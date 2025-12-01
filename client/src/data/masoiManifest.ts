// Auto-generated manifest for Masoi assets
export type MasoiAssetType = "Dan" | "MaSoi" | "DocLap" | "DoiPhe" | "Extra";
export interface MasoiAssetMeta {
  id: string;
  name: string;
  type: MasoiAssetType;
  alignment: string | null;
  description: string;
  asset: string;
}

export const MASOI_ASSETS: MasoiAssetMeta[] = [
  {
    "id": "bacsi",
    "name": "Bác Sĩ",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Mỗi đêm chọn một người để che chở, người đó sẽ không bị giết vào đêm đấy.",
    "asset": "/masoi/bacsi.png"
  },
  {
    "id": "bagiakhotinh",
    "name": "Bà Già Khó Tính",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Sau đêm đầu, mỗi đêm chọn một người; sáng hôm sau người đó không thể nói chuyện hoặc bỏ phiếu.",
    "asset": "/masoi/bagiakhotinh.png"
  },
  {
    "id": "bansoi",
    "name": "Bán Sói",
    "type": "DoiPhe",
    "alignment": "Thien",
    "description": "Ban đầu là Dân; khi bị Ma Sói cắn sẽ trở thành Ma Sói và không thể bị Giáo Chủ đổi phe.",
    "asset": "/masoi/bansoi.png"
  },
  {
    "id": "baove",
    "name": "Bảo Vệ",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Có hai mạng, mỗi đêm chọn một người để bảo vệ; khi mục tiêu bị tấn công bạn mất một mạng.",
    "asset": "/masoi/baove.png"
  },
  {
    "id": "cansattruong",
    "name": "Cansattruong",
    "type": "Extra",
    "alignment": null,
    "description": "",
    "asset": "/masoi/cansattruong.png"
  },
  {
    "id": "capdoiyeunhau",
    "name": "Cặp Đôi Yêu Nhau",
    "type": "DoiPhe",
    "alignment": "KhongRo",
    "description": "Hai người được ghép cặp; nếu cả hai là người cuối cùng còn sống thì cùng chiến thắng.",
    "asset": "/masoi/capdoiyeunhau.png"
  },
  {
    "id": "caubemiengbu",
    "name": "Cậu Bé Miệng Bự",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Chọn một người; khi bạn chết vai trò của người đó sẽ được tiết lộ.",
    "asset": "/masoi/caubemiengbu.png"
  },
  {
    "id": "condo",
    "name": "Côn Đồ",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Có thể giết một người hoặc tìm Đồng Phạm bằng cách dụ dỗ vào đêm. Không thể bị Ma Sói giết.",
    "asset": "/masoi/condo.png"
  },
  {
    "id": "danlang",
    "name": "Dân Làng",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Không có chức năng đặc biệt.",
    "asset": "/masoi/danlang.png"
  },
  {
    "id": "gianoel",
    "name": "Gianoel",
    "type": "Extra",
    "alignment": null,
    "description": "",
    "asset": "/masoi/gianoel.png"
  },
  {
    "id": "giaochu",
    "name": "Giáo Chủ",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Mỗi đêm có thể cải đạo một người để gia nhập giáo phái. Nếu bạn chết, tín đồ chết theo.",
    "asset": "/masoi/giaochu.png"
  },
  {
    "id": "hoabecon",
    "name": "Hoa Bé Con",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Có thể bảo vệ một người chơi khỏi việc bị dân làng treo cổ.",
    "asset": "/masoi/hoabecon.png"
  },
  {
    "id": "keanthitnguoi",
    "name": "Kẻ Ăn Thịt Người",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Mỗi đêm có thể giết một người hoặc nhịn đói để dồn lại và giết tối đa 5 người trong một đêm.",
    "asset": "/masoi/keanthitnguoi.png"
  },
  {
    "id": "kebaothu",
    "name": "Kẻ Báo Thù",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Chọn trước một người; khi bạn bị giết, người đó sẽ chết theo.",
    "asset": "/masoi/kebaothu.png"
  },
  {
    "id": "kedatbom",
    "name": "Kẻ Đặt Bom",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Đặt một quả bom vào ban đêm; bom sẽ nổ vào đêm tiếp theo.",
    "asset": "/masoi/kedatbom.png"
  },
  {
    "id": "kedongpham",
    "name": "Kẻ Đồng Phạm",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Cùng Côn Đồ giết một người mỗi đêm. Nếu phiếu bầu hòa, phiếu của bạn thắng.",
    "asset": "/masoi/kedongpham.png"
  },
  {
    "id": "kephonghoa",
    "name": "Kẻ Phóng Hỏa",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Mỗi đêm tẩm xăng tối đa 2 người hoặc đốt cháy tất cả người đã bị tẩm xăng.",
    "asset": "/masoi/kephonghoa.png"
  },
  {
    "id": "ketrommo",
    "name": "Kẻ Trộm Mộ",
    "type": "DoiPhe",
    "alignment": "KhongRo",
    "description": "Chọn một người ngay từ đầu; khi họ chết bạn trộm vai trò và đổi phe vào ngày hôm sau.",
    "asset": "/masoi/ketrommo.png"
  },
  {
    "id": "lucsi",
    "name": "Lực Sĩ",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Mỗi đêm chọn một người để bảo vệ. Nếu mục tiêu bị tấn công, không ai chết và bạn thấy vai trò kẻ tấn công nhưng sẽ chết cuối ngày hôm sau.",
    "asset": "/masoi/lucsi.png"
  },
  {
    "id": "masoi",
    "name": "Ma Sói",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Mỗi đêm cùng đồng bọn chọn một người để cắn chết.",
    "asset": "/masoi/masoi.png"
  },
  {
    "id": "mucsu",
    "name": "Mục Sư",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Có thể vẩy nước thánh lên một người chơi. Nếu đó là Ma Sói, họ chết; nếu không, bạn chết.",
    "asset": "/masoi/mucsu.png"
  },
  {
    "id": "nguoikhaimenh",
    "name": "Người Khai Mệnh",
    "type": "Dan",
    "alignment": "KhongRo",
    "description": "Sở hữu hai lá bài và có thể đưa cho 2 người chơi vào ban đêm; người dùng lá bài sẽ tiết lộ vai trò.",
    "asset": "/masoi/nguoikhaimenh.png"
  },
  {
    "id": "nguoiyeuhoabinh",
    "name": "Người Yêu Hòa Bình",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Có thể tiết lộ vai trò để ngăn mọi người bỏ phiếu trong một ngày (một lần).",
    "asset": "/masoi/nguoiyeuhoabinh.png"
  },
  {
    "id": "nhagiakim",
    "name": "Nhà Giả Kim",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Pha chế được nhiều loại thuốc đặc biệt, có thể xoay chuyển cục diện.",
    "asset": "/masoi/nhagiakim.png"
  },
  {
    "id": "phuthuy",
    "name": "Phù Thủy",
    "type": "Dan",
    "alignment": "KhongRo",
    "description": "Có hai bình thuốc: một bình cứu và một bình giết. Bình cứu chỉ dùng khi mục tiêu bị tấn công trong đêm.",
    "asset": "/masoi/phuthuy.png"
  },
  {
    "id": "quannguc",
    "name": "Quản Ngục",
    "type": "Dan",
    "alignment": "KhongRo",
    "description": "Mỗi đêm giam một người để nói chuyện. Người bị giam không dùng được kỹ năng; có thể giết họ một lần trong ván.",
    "asset": "/masoi/quannguc.png"
  },
  {
    "id": "satnhanhanhthuat",
    "name": "Satnhanhanhthuat",
    "type": "Extra",
    "alignment": null,
    "description": "",
    "asset": "/masoi/satnhanhanhthuat.png"
  },
  {
    "id": "soiacmong",
    "name": "Sói Ác Mộng",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Hai lần trong ván, ban ngày chọn một người để họ không dùng chức năng vào ban đêm.",
    "asset": "/masoi/soiacmong.png"
  },
  {
    "id": "soibaoho",
    "name": "Sói Bảo Hộ",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Một lần bảo vệ một người khỏi bị treo cổ, kể cả chính bạn.",
    "asset": "/masoi/soibaoho.png"
  },
  {
    "id": "soidaudan",
    "name": "Sói Đầu Đàn",
    "type": "MaSoi",
    "alignment": "KhongRo",
    "description": "Ma Sói bình thường nhưng có gấp đôi phiếu bầu trong đêm.",
    "asset": "/masoi/soidaudan.png"
  },
  {
    "id": "soidiencuong",
    "name": "Sói Điên Cuồng",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Một lần kích hoạt trạng thái Điên Cuồng; đêm sau nếu giết người được bảo vệ thì cả người đó và người bảo vệ đều chết.",
    "asset": "/masoi/soidiencuong.png"
  },
  {
    "id": "soihacam",
    "name": "Sói Hắc Ám",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Một lần nhân đôi số phiếu phe mình và ẩn tất cả phiếu trong ngày.",
    "asset": "/masoi/soihacam.png"
  },
  {
    "id": "soihoabinh",
    "name": "Sói Hòa Bình",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Một lần tiết lộ vai trò của một người cho làng và ngăn bỏ phiếu ngày hôm đó.",
    "asset": "/masoi/soihoabinh.png"
  },
  {
    "id": "soimeocon",
    "name": "Sói Mèo Con",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Một lần mỗi ván có thể biến một người Dân thành Ma Sói.",
    "asset": "/masoi/soimeocon.png"
  },
  {
    "id": "soiphapsu",
    "name": "Sói Pháp Sư",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Ban ngày yểm một người; khi bị Tiên Tri soi người đó hiện lên như Ma Sói.",
    "asset": "/masoi/soiphapsu.png"
  },
  {
    "id": "soiphuthuy",
    "name": "Sói Phù Thủy",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Mỗi đêm xem vai trò của một người nhưng không thể nói chuyện với Sói khác ban đêm.",
    "asset": "/masoi/soiphuthuy.png"
  },
  {
    "id": "soitientri",
    "name": "Sói Tiên Tri",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Mỗi đêm xem vai trò của một người và cả bầy Sói đều biết.",
    "asset": "/masoi/soitientri.png"
  },
  {
    "id": "soitre",
    "name": "Sói Trẻ",
    "type": "MaSoi",
    "alignment": "Ac",
    "description": "Chọn một người sẽ chết theo bạn khi bạn bị giết.",
    "asset": "/masoi/soitre.png"
  },
  {
    "id": "thamtu",
    "name": "Thám Tử",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Mỗi đêm chọn 2 người chơi và biết họ có cùng phe với nhau hay không.",
    "asset": "/masoi/thamtu.png"
  },
  {
    "id": "thaydong",
    "name": "Thầy Đồng",
    "type": "Dan",
    "alignment": "KhongRo",
    "description": "Mỗi đêm nói chuyện với người chết và có thể hồi sinh một người trong cả ván.",
    "asset": "/masoi/thaydong.png"
  },
  {
    "id": "thitruong",
    "name": "Thị Trưởng",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Có thể tiết lộ vai trò để lá phiếu được tính gấp đôi.",
    "asset": "/masoi/thitruong.png"
  },
  {
    "id": "thophucsinh",
    "name": "Thophucsinh",
    "type": "Extra",
    "alignment": null,
    "description": "",
    "asset": "/masoi/thophucsinh.png"
  },
  {
    "id": "thoren",
    "name": "Thợ Rèn",
    "type": "Dan",
    "alignment": "KhongRo",
    "description": "Có thể rèn 2 chiếc khiên và 1 thanh kiếm, mỗi đêm rèn một món và phải đưa cho người khác trước khi rèn món mới.",
    "asset": "/masoi/thoren.png"
  },
  {
    "id": "thosan",
    "name": "Thosan",
    "type": "Extra",
    "alignment": null,
    "description": "",
    "asset": "/masoi/thosan.png"
  },
  {
    "id": "thosannguoi",
    "name": "Thợ Săn Người",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Đầu ván chọn mục tiêu. Nếu mục tiêu bị treo cổ ban ngày, bạn thắng cùng phe Dân; nếu chết cách khác, bạn trở thành Dân Làng.",
    "asset": "/masoi/thosannguoi.png"
  },
  {
    "id": "tintac",
    "name": "Tin Tặc",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Mỗi đêm chọn một người để xâm nhập: họ không thể nói chuyện hoặc bỏ phiếu ngày hôm sau và sẽ chết cuối ngày.",
    "asset": "/masoi/tintac.png"
  },
  {
    "id": "tongthong",
    "name": "Tổng Thống",
    "type": "Dan",
    "alignment": "Thien",
    "description": "Mọi người biết bạn là Tổng Thống từ đầu ván. Nếu bạn chết, phe Dân thua.",
    "asset": "/masoi/tongthong.png"
  },
  {
    "id": "xacsong",
    "name": "Xác Sống",
    "type": "DocLap",
    "alignment": "KhongRo",
    "description": "Mỗi đêm có thể cắn một người; người đó trở thành zombie vào cuối đêm hôm sau.",
    "asset": "/masoi/xacsong.png"
  }
] as const;

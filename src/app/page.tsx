export default function Home() {
  return (
    <div className="text-center">
      <div className="m-auto p-2 w-full max-w-[500px] bg-blue-500 text-white text-left rounded-md">
        <p className="text-[20px]">GATEWAY EXPRESS</p>
        <p className="text-[30px]">Gửi hàng quốc tế</p>
        <p className="text-[16px] " style={{ lineHeight: 1.5 }}>
          Với nhiều năm kinh nghiệm trong lĩnh vực vận chuyển hàng không quốc tế, Gateway Express với đội ngũ chuyên viên năng động, tận tâm với công việc sẽ giúp quý khách gửi hàng nhanh chóng, tiết
          kiệm và đơn giản nhất.
        </p>
        <div className="p-2 flex gap-3">
          <a href="tel: 0938373343" className="p-2 bg-cyan-500">
            <span> 0938 373 343</span>
          </a>
          <a href="tel:0944247267" className="p-2 bg-green-500">
            <span className="">0944 247 267</span>
          </a>
        </div>
      </div>
    </div>
  );
}

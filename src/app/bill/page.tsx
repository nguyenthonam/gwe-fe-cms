import BillForm from "@/components/BillForm";
import BillPrint from "@/components/BillPrint";

export default function Bill() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Hóa Đơn Gửi Hàng</h1>

      <BillForm />
    </div>
  );
}

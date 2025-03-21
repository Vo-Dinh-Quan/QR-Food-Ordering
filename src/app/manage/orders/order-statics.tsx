import { Fragment, useState } from 'react'
import { Users } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { OrderStatusIcon, cn, getVietnameseOrderStatus } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { TableListResType } from '@/schemaValidations/table.schema'
import { Badge } from '@/components/ui/badge'
import { ServingGuestByTableNumber, Statics, StatusCountObject } from '@/app/manage/orders/order-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import OrderGuestDetail from '@/app/manage/orders/order-guest-detail'

/*
Ví dụ về cấu trúc của statics:
const statics: Statics = {
  status: {
    Pending: 1,
    Processing: 2,
    Delivered: 3,
    Paid: 5,
    Rejected: 0
  },
  table: {
    1: { // Bàn số 1
      20: { // Guest 20
        Pending: 1,
        Processing: 2,
        Delivered: 3,
        Paid: 5,
        Rejected: 0
      },
      21: { // Guest 21
        Pending: 1,
        Processing: 2,
        Delivered: 3,
        Paid: 5,
        Rejected: 0
      }
    }
  }
}
*/

// Component OrderStatics nhận vào 3 props: 
// - statics: thống kê tổng số đơn hàng theo trạng thái và theo bàn/guest
// - tableList: danh sách bàn (theo kiểu dữ liệu từ TableListResType['data'])
// - servingGuestByTableNumber: dữ liệu nhóm khách hàng đang được phục vụ theo số bàn
export default function OrderStatics({
  statics,
  tableList,
  servingGuestByTableNumber
}: {
  statics: Statics
  tableList: TableListResType['data']
  servingGuestByTableNumber: ServingGuestByTableNumber
}) {
  // State để lưu trữ số bàn đang được chọn, mặc định là 0 (không có bàn nào được chọn)
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(0)
  // Lấy ra dữ liệu khách hàng đang phục vụ tại bàn được chọn từ servingGuestByTableNumber
  const selectedServingGuest = servingGuestByTableNumber[selectedTableNumber]

  return (
    // Sử dụng Fragment để gom nhóm nhiều component con mà không tạo thêm phần tử DOM
    <Fragment>
      {/* Component Dialog (hộp thoại) hiển thị chi tiết đơn hàng của khách đang phục vụ tại bàn được chọn */}
      <Dialog
        // Hiển thị dialog nếu có bàn được chọn (selectedTableNumber khác 0)
        open={Boolean(selectedTableNumber)}
        // Khi đóng dialog, set lại selectedTableNumber về 0 (không bàn nào được chọn)
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableNumber(0)
          }
        }}
      >
        {/* Nội dung của dialog, cho phép cuộn nếu nội dung vượt quá chiều cao tối đa */}
        <DialogContent className='max-h-full overflow-auto'>
          {selectedServingGuest && (
            <DialogHeader>
              {/* Tiêu đề dialog hiển thị số bàn đang được chọn */}
              <DialogTitle>Khách đang ngồi tại bàn {selectedTableNumber}</DialogTitle>
            </DialogHeader>
          )}
          <div>
            {/* Nếu có dữ liệu khách phục vụ, lặp qua từng guest (dựa vào key guestId) */}
            {selectedServingGuest &&
              // trả về 1 mảng các key của selectedServingGuest, sau đó lặp qua từng key
              Object.keys(selectedServingGuest).map((guestId, index) => {
                // Lấy ra mảng đơn hàng của guest, ép guestId sang kiểu số
                const orders = selectedServingGuest[Number(guestId)]
                return (
                  <div key={guestId}>
                    <OrderGuestDetail guest={orders[0].guest} orders={orders} />
                    {/* Nếu không phải guest cuối cùng, hiển thị Separator để phân cách giữa các guest */}
                    {index !== Object.keys(selectedServingGuest).length - 1 && <Separator className='my-5' />}
                  </div>
                )
              })}
          </div>
        </DialogContent>
      </Dialog>
  
      {/* Phần hiển thị danh sách các bàn */}
      <div className='flex justify-start items-stretch gap-4 flex-wrap py-4'>
        {/* Lặp qua từng bàn trong tableList */}
        {tableList.map((table) => {
          // Lấy số bàn từ đối tượng table
          const tableNumber: number = table.number
          // Lấy thống kê của bàn hiện tại từ statics.table, kiểu là object mapping guestId đến StatusCountObject
          const tableStatics: Record<number, StatusCountObject> | undefined = statics.table[tableNumber]

          // Biến đánh dấu bàn có trống (không có đơn hàng phục vụ) hay không, khởi tạo mặc định là true (trống)
          let isEmptyTable = true
          // Khởi tạo countObject chứa số đếm đơn hàng theo từng trạng thái với giá trị ban đầu là 0
          let countObject: StatusCountObject = {
            Pending: 0,
            Processing: 0,
            Delivered: 0,
            Paid: 0,
            Rejected: 0
          }
          // Tính số lượng khách đang được phục vụ tại bàn này, bằng cách đếm số lượng guest trong servingGuestByTableNumber của bàn đó
          const servingGuestCount = Object.values(servingGuestByTableNumber[tableNumber] ?? []).length

          // Nếu có thống kê cụ thể cho bàn (tableStatics không undefined)
          if (tableStatics) {
            // Lặp qua từng guestId trong tableStatics
            for (const guestId in tableStatics) {
              // Lấy số liệu thống kê của guest tại bàn (số lượng đơn theo từng trạng thái)
              const guestStatics = tableStatics[Number(guestId)]
              // Kiểm tra xem có đơn hàng nào trong các trạng thái "Pending", "Processing", "Delivered" không
              // Nếu có, bàn này không trống
              if (
                [guestStatics.Pending, guestStatics.Processing, guestStatics.Delivered].some(
                  (status) => status !== 0 && status !== undefined
                )
              ) {
                isEmptyTable = false
              }
              // Cộng dồn số lượng đơn hàng của guest vào countObject theo từng trạng thái
              countObject = {
                Pending: countObject.Pending + (guestStatics.Pending ?? 0),
                Processing: countObject.Processing + (guestStatics.Processing ?? 0),
                Delivered: countObject.Delivered + (guestStatics.Delivered ?? 0),
                Paid: countObject.Paid + (guestStatics.Paid ?? 0),
                Rejected: countObject.Rejected + (guestStatics.Rejected ?? 0)
              }
            }
          }

          // Render giao diện cho từng bàn
          return (
            <div
              key={tableNumber}
              // Dùng hàm cn để kết hợp các className dựa vào trạng thái bàn (có đơn hàng hay không)
              className={cn('text-sm flex items-stretch gap-2 border p-2 rounded-md', {
                // Nếu bàn không trống, đổi nền và ẩn đường viền
                'bg-secondary': !isEmptyTable,
                'border-transparent': !isEmptyTable
              })}
              // Khi click vào bàn, nếu bàn không trống, set selectedTableNumber để mở dialog chi tiết
              onClick={() => {
                if (!isEmptyTable) setSelectedTableNumber(tableNumber)
              }}
            >
              {/* Phần bên trái hiển thị số bàn và số khách đang phục vụ */}
              <div className='flex flex-col items-center justify-center gap-2'>
                {/* Hiển thị số bàn lớn và nổi bật */}
                <div className='font-semibold text-center text-lg'>{tableNumber}</div>
                {/* Sử dụng Tooltip để hiển thị thông tin số khách khi hover */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-2'>
                        {/* Icon người đại diện cho khách */}
                        <Users className='h-4 w-4' />
                        {/* Hiển thị số khách đang phục vụ */}
                        <span>{servingGuestCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Đang phục vụ: {servingGuestCount} khách</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {/* Separator dọc giữa thông tin số bàn và chi tiết trạng thái đơn hàng */}
              <Separator
                orientation='vertical'
                className={cn('flex-shrink-0 flex-grow h-auto', {
                  'bg-muted-foreground': !isEmptyTable
                })}
              />
              {/* Nếu bàn trống, hiển thị thông báo "Ready" */}
              {isEmptyTable && <div className='flex justify-between items-center text-sm'>Ready</div>}
              {/* Nếu bàn không trống, hiển thị số đơn hàng theo từng trạng thái */}
              {!isEmptyTable && (
                <div className='flex flex-col gap-2'>
                  <TooltipProvider>
                    {/* Tooltip cho trạng thái Pending */}
                    <Tooltip>
                      <TooltipTrigger>
                        <div className='flex gap-2 items-center'>
                          {/* Icon hiển thị trạng thái Pending */}
                          <OrderStatusIcon.Pending className='w-4 h-4' />
                          {/* Hiển thị số lượng đơn hàng Pending */}
                          <span>{countObject[OrderStatus.Pending] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Pending)}: {countObject[OrderStatus.Pending] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>
                    {/* Tooltip cho trạng thái Processing */}
                    <Tooltip>
                      <TooltipTrigger>
                        <div className='flex gap-2 items-center'>
                          <OrderStatusIcon.Processing className='w-4 h-4' />
                          <span>{countObject[OrderStatus.Processing] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Processing)}: {countObject[OrderStatus.Processing] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>
                    {/* Tooltip cho trạng thái Delivered */}
                    <Tooltip>
                      <TooltipTrigger>
                        <div className='flex gap-2 items-center'>
                          <OrderStatusIcon.Delivered className='w-4 h-4' />
                          <span>{countObject[OrderStatus.Delivered] ?? 0}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getVietnameseOrderStatus(OrderStatus.Delivered)}: {countObject[OrderStatus.Delivered] ?? 0} đơn
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* Phần hiển thị tổng số đơn hàng theo từng trạng thái (toàn bộ hệ thống) */}
      <div className='flex justify-start items-end gap-4 flex-wrap py-4'>
        {OrderStatusValues.map((status) => (
          // Sử dụng Badge để hiển thị số lượng đơn hàng của từng trạng thái
          <Badge variant='secondary' key={status}>
            {getVietnameseOrderStatus(status)}: {statics.status[status] ?? 0}
          </Badge>
        ))}
      </div>
    </Fragment>
  )
}

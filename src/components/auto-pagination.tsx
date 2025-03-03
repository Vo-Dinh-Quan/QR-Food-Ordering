import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination' // Import các component giao diện phân trang
import { cn } from '@/lib/utils' // Import hàm cn để kết hợp các class conditionally

// Định nghĩa interface Props cho component, bao gồm:
// - page: trang hiện tại
// - pageSize: tổng số trang
// - pathname: đường dẫn để tạo link chuyển trang
interface Props {
  page: number
  pageSize: number
  pathname: string
}

/**
 * Chú thích về logic phân trang với RANGE = 2:
 *
 * Với RANGE = 2, ta hiển thị các số trang theo quy tắc:
 * - Luôn hiển thị 2 số trang đầu và 2 số trang cuối.
 * - Hiển thị 2 số trang xung quanh trang hiện tại.
 * - Nếu có khoảng cách quá lớn giữa các nhóm số trang, thay thế bằng dấu chấm lửng (...).
 *
 * Ví dụ với 20 trang, các trường hợp có thể hiển thị như sau:
 *
 * [1] 2 3 ... 19 20
 * 1 [2] 3 4 ... 19 20 
 * 1 2 [3] 4 5 ... 19 20
 * 1 2 3 [4] 5 6 ... 19 20
 * 1 2 3 4 [5] 6 7 ... 19 20
 *
 * 1 2 ... 4 5 [6] 8 9 ... 19 20
 *
 * 1 2 ... 13 14 [15] 16 17 ... 19 20
 *
 * 1 2 ... 14 15 [16] 17 18 19 20
 * 1 2 ... 15 16 [17] 18 19 20
 * 1 2 ... 16 17 [18] 19 20
 * 1 2 ... 17 18 [19] 20
 * 1 2 ... 18 19 [20]
 */

// Số lượng khoảng cách xung quanh current_page
const RANGE = 2

export default function AutoPagination({ page, pageSize, pathname }: Props) {
  // Hàm renderPagination tạo danh sách các nút phân trang
  const renderPagination = () => {
    // Biến đánh dấu để đảm bảo chỉ hiển thị 1 dấu chấm lửng trước và sau mỗi nhóm
    let dotAfter = false
    let dotBefore = false

    // Hàm trả về nút phân trang dấu chấm lửng trước (dùng khi có khoảng cách lớn ở bên trái current_page)
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <PaginationItem key={`dot-before-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return null
    }

    // Hàm trả về nút phân trang dấu chấm lửng sau (dùng khi có khoảng cách lớn ở bên phải current_page)
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <PaginationItem key={`dot-after-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return null
    }

    // Tạo mảng có độ dài bằng tổng số trang (pageSize)
    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        // Tính số trang dựa trên index (vì index bắt đầu từ 0 nên cộng thêm 1)
        const pageNumber = index + 1

        // Điều kiện cho trường hợp khi trang hiện tại nằm ở phần đầu (ít trang bên trái):
        // Nếu trang hiện tại <= RANGE * 2 + 1 (ví dụ: <= 5 nếu RANGE = 2)
        // Và nếu pageNumber vượt quá khoảng trang cần hiển thị bên phải (sau current_page)
        // Đồng thời pageNumber nằm trước các trang cuối (để đảm bảo luôn hiển thị các trang cuối)
        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
          return renderDotAfter(index)
        } 
        // Điều kiện cho trường hợp khi trang hiện tại nằm ở giữa:
        // Nếu trang hiện tại > RANGE * 2 + 1 (nghĩa là có nhiều trang bên trái)
        // Và trang hiện tại < pageSize - RANGE * 2 (có nhiều trang bên phải)
        else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
          // Nếu pageNumber nhỏ hơn current_page - RANGE và lớn hơn RANGE (để không hiển thị trùng với các trang đầu)
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } 
          // Nếu pageNumber lớn hơn current_page + RANGE và nhỏ hơn pageSize - RANGE + 1 (để không hiển thị trùng với các trang cuối)
          else if (pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
            return renderDotAfter(index)
          }
        } 
        // Điều kiện cho trường hợp khi trang hiện tại nằm ở phần cuối:
        // Nếu trang hiện tại >= pageSize - RANGE * 2 (ví dụ: >= 18 nếu pageSize = 20 và RANGE = 2)
        // Và nếu pageNumber nằm giữa các trang đầu và current_page - RANGE
        else if (page >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE) {
          return renderDotBefore(index)
        }
        // Nếu không thỏa mãn các điều kiện trên, hiển thị số trang thông thường
        return (
          <PaginationItem key={index}>
            <PaginationLink
              href={{
                pathname, // Sử dụng pathname được truyền vào
                query: {
                  page: pageNumber // Query page tương ứng với số trang
                }
              }}
              isActive={pageNumber === page} // Đánh dấu trang hiện tại là active
            >
              {pageNumber} {/* Hiển thị số trang */}
            </PaginationLink>
          </PaginationItem>
        )
      })
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Nút "Previous" để quay lại trang trước */}
        <PaginationItem>
          <PaginationPrevious
            href={{
              pathname,
              query: {
                page: page - 1 // Trang trước: giảm 1 đơn vị
              }
            }}
            // Sử dụng hàm cn để áp dụng class 'cursor-not-allowed' khi trang hiện tại là trang đầu tiên
            className={cn({
              'cursor-not-allowed': page === 1
            })}
            // Ngăn không cho chuyển trang khi đang ở trang đầu tiên
            onClick={(e) => {
              if (page === 1) {
                e.preventDefault()
              }
            }}
          />
        </PaginationItem>

        {/* Gọi hàm renderPagination để hiển thị các nút phân trang (số trang và dấu chấm lửng) */}
        {renderPagination()}

        {/* Nút "Next" để chuyển sang trang kế tiếp */}
        <PaginationItem>
          <PaginationNext
            href={{
              pathname,
              query: {
                page: page + 1 // Trang tiếp theo: tăng 1 đơn vị
              }
            }}
            // Áp dụng class 'cursor-not-allowed' nếu đang ở trang cuối cùng
            className={cn({
              'cursor-not-allowed': page === pageSize
            })}
            // Ngăn không cho chuyển trang khi đang ở trang cuối
            onClick={(e) => {
              if (page === pageSize) {
                e.preventDefault()
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

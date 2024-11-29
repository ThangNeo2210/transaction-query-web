'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Search, Calendar, DollarSign, ArrowUpDown, Download, Moon, Sun, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Toaster } from "sonner"





// Cập nhật interface Transaction để match với format data
interface Transaction {
  dateTime: string;    // sẽ được format từ date_time
  transId: string;     // từ trans_no
  credit: number;      // từ credit (convert sang number)
  detail: string;      // giữ nguyên từ detail
}

// Add interface for raw response data
interface RawTransaction {
  date_time: string;
  trans_no: string;
  credit: string;
  detail: string;
}

// Thêm interface để định nghĩa kiểu dữ liệu response
interface SearchResponse {
  success: boolean;
  data: RawTransaction[];  // Changed from Transaction[] to RawTransaction[]
  message?: string;
}


function generatePaginationNumbers(currentPage: number, totalPages: number) {
  const delta = 2; 
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export function TransactionQueryComponent() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minCredit, setMinCredit] = useState('')
  const [maxCredit, setMaxCredit] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Define itemsPerPage as a constant
  const itemsPerPage = 10

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!startDate && !endDate && !minCredit && !maxCredit && !searchTerm) {
      toast.warning('Vui lòng nhập ít nhất một điều kiện tìm kiếm', {
        position: 'top-right',
        duration: 3000,
        className: 'my-toast-class',
      })
      return
    }

    // Validate date range
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        toast.error('Ngày kết thúc phải lớn hơn ngày bắt đầu', {
            position: 'top-right',
            duration: 3000,
        })
        return
    }

    // Validate credit range
    if (minCredit || maxCredit) {
        const min = Number(minCredit)
        const max = Number(maxCredit)

        if (minCredit && min < 0) {
            toast.error('Số tiền không được âm', {
                position: 'top-right',
                duration: 3000,
            })
            return
        }

        if (minCredit && maxCredit && max < min) {
            toast.error('Số tiền tối đa phải lớn hơn số tiền tối thiểu', {
                position: 'top-right',
                duration: 3000,
            })
            return
        }
    }

    setIsLoading(true)
    setError(null)
    
    try {
        // Xây dựng query parameters
        const params = new URLSearchParams()
        
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (minCredit) params.append('minCredit', minCredit)
        if (maxCredit) params.append('maxCredit', maxCredit)
        if (searchTerm) params.append('detail', searchTerm)

        
        // Gọi API backend
        const response = await fetch(`http://localhost:3001/search?${params.toString()}`)
        const data: SearchResponse = await response.json()


        if (data.success) {
            // Transform raw data to match Transaction interface
            const transformedData = data.data.map(item => ({
                dateTime: formatDateTime(item.date_time),
                transId: item.trans_no,
                credit: Number(item.credit),
                detail: item.detail
            }));
            
            setResults(transformedData);
            setCurrentPage(1);
            
            if (data.data.length === 0) {
                toast.info('Không tìm thấy kết quả phù hợp', {
                    position: 'top-right',
                    duration: 3000,
                });
            }
        } else {
            throw new Error(data.message || 'Có lỗi xảy ra')
        }
    } catch (err) {
        setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.')
        toast.error('Có lỗi xảy ra khi tìm kiếm', {
            position: 'top-right',
            duration: 3000,
        })
    } finally {
        setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn as keyof Transaction]
    const bValue = b[sortColumn as keyof Transaction]
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(results.length / itemsPerPage)

  const exportToCSV = () => {
    const headers = ['Date & Time', 'Transaction ID', 'Credit', 'Detail']
    const csvContent = [
      headers.join(','),
      ...results.map(row => [row.dateTime, row.transId, row.credit, `"${row.detail}"`].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'transaction_results.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Thêm hàm helper để format date time
  function formatDateTime(dateTimeStr: string): string {
    // Input format: "04/09/2024_5245.19623"
    // Tách phần ngày và phần thời gian
    const [date, timeStr] = dateTimeStr.split('_');
    
    // Format lại date để hiển thị
    const [day, month, year] = date.split('/');
    
    // Lấy phần nguyên của thời gian
    const time = timeStr.split('.')[0];
    
    // Format thời gian thành HH:mm:ss
    const formattedTime = time.padStart(6, '0')
      .replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3');
    
    // Kết hợp ngày và giờ
    return `${day}/${month}/${year} ${formattedTime}`;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 transition-colors duration-200">
      <Toaster 
        theme={theme as "light" | "dark"}
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            border: '1px solid',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          },
        }}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary"></h1>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="data-[state=checked]:bg-primary"
                />
                <Moon className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle dark mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Card className="bg-card text-card-foreground shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Tìm Kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
                {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="minCredit">Min Credit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="minCredit"
                        type="number"
                        value={minCredit}
                        onChange={(e) => setMinCredit(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="maxCredit">Max Credit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxCredit"
                        type="number"
                        value={maxCredit}
                        onChange={(e) => setMaxCredit(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="searchTerm">Search Details</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchTerm"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search transaction details..."
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? 'Đang Tìm Kiếm...' : 'Tìm Kiếm Giao Dịch'}
                </Button>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="bg-card text-card-foreground shadow-lg border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Kết Quả Tìm Kiếm</CardTitle>
                <CardDescription>Found {results.length} transactions</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={exportToCSV} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download results as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="cursor-pointer" onClick={() => handleSort('dateTime')}>
                      Date & Time {sortColumn === 'dateTime' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('transId')}>
                      Transaction ID {sortColumn === 'transId' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('credit')}>
                      Credit {sortColumn === 'credit' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('detail')}>
                      Detail {sortColumn === 'detail' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.map((transaction) => (
                    <TableRow 
                      key={transaction.transId} 
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell>{transaction.dateTime}</TableCell>
                      <TableCell>{transaction.transId}</TableCell>
                      <TableCell>{transaction.credit}</TableCell>
                      <TableCell>{transaction.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(prev => prev - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {generatePaginationNumbers(currentPage, totalPages).map((pageNum, idx) => (
                    <PaginationItem key={idx}>
                      {pageNum === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(Number(pageNum));
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
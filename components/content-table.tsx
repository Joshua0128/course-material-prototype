'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Eye,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { ContentAsset } from '@/lib/types';

interface ContentTableProps {
  assets: ContentAsset[];
  onDelete: (id: string) => void;
}

export function ContentTable({ assets, onDelete }: ContentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');

  // 取得所有唯一的風格和受眾
  const styles = useMemo(() => {
    const uniqueStyles = new Set(assets.map(asset => asset.formData.style));
    return Array.from(uniqueStyles);
  }, [assets]);

  const audiences = useMemo(() => {
    const uniqueAudiences = new Set(assets.map(asset => asset.formData.audience));
    return Array.from(uniqueAudiences);
  }, [assets]);

  // 篩選資料
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch =
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.formData.audience.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStyle = styleFilter === 'all' || asset.formData.style === styleFilter;
      const matchesAudience = audienceFilter === 'all' || asset.formData.audience === audienceFilter;

      return matchesSearch && matchesStyle && matchesAudience;
    });
  }, [assets, searchQuery, styleFilter, audienceFilter]);

  const getStyleLabel = (style: string) => {
    const styleMap: Record<string, string> = {
      professional: '專業正式',
      casual: '輕鬆活潑',
      academic: '學術研究',
      creative: '創意趣味',
      simple: '簡潔明瞭',
    };
    return styleMap[style] || style;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStyleFilter('all');
    setAudienceFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || styleFilter !== 'all' || audienceFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* 篩選區域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/* 搜尋框 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜尋標題、檔名或受眾..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* 風格篩選 */}
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="風格篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有風格</SelectItem>
                  {styles.map(style => (
                    <SelectItem key={style} value={style}>
                      {getStyleLabel(style)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 受眾篩選 */}
              <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="受眾篩選" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有受眾</SelectItem>
                  {audiences.map(audience => (
                    <SelectItem key={audience} value={audience}>
                      {audience}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 重置按鈕 */}
              {hasActiveFilters && (
                <Button variant="ghost" onClick={resetFilters}>
                  清除篩選
                </Button>
              )}
            </div>

            {/* 結果統計 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                顯示 {filteredAssets.length} / {assets.length} 筆內容
              </span>
              {hasActiveFilters && (
                <span className="text-primary">已套用篩選條件</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">標題</TableHead>
                <TableHead>檔案名稱</TableHead>
                <TableHead>受眾</TableHead>
                <TableHead>風格</TableHead>
                <TableHead>題目數</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {hasActiveFilters ? '沒有符合條件的內容' : '尚無內容'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/content/${asset.id}`}
                        className="hover:text-primary hover:underline line-clamp-2"
                      >
                        {asset.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {asset.fileName}
                      </span>
                    </TableCell>
                    <TableCell>{asset.formData.audience}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getStyleLabel(asset.formData.style)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {asset.questionData.questions.length} 題
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(asset.createdAt), 'yyyy/MM/dd HH:mm', {
                        locale: zhCN,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/content/${asset.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              查看
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(asset.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

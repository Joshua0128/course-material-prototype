'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Users,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { storageService } from '@/lib/storage';
import { ContentTable } from '@/components/content-table';
import type { ContentAsset } from '@/lib/types';

export function Dashboard() {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    const allAssets = storageService.getAll();
    setAssets(allAssets);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      storageService.delete(deleteId);
      loadAssets();
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的內容</h1>
          <p className="text-muted-foreground mt-1">
            管理您所有生成的內容資產
          </p>
        </div>
        <Link href="/create">
          <Button size="lg">
            <Plus className="h-4 w-4 mr-2" />
            新增內容
          </Button>
        </Link>
      </div>

      {/* Content Table */}
      {assets.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">尚無內容</h3>
            <p className="text-muted-foreground mb-6 text-center">
              開始上傳檔案並生成您的第一個內容資產
            </p>
            <Link href="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增內容
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ContentTable assets={assets} onDelete={handleDelete} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原。確定要刪除這個內容嗎？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DishTable from "@/app/manage/tables/table-table";
import { Suspense } from "react";

export default function TablesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2 w-full max-w-full overflow-x-hidden">
        <Card
          className="w-full max-w-full overflow-x-auto"
          x-chunk="dashboard-06-chunk-0">
          <CardHeader className="min-w-0">
            <CardTitle>Bàn ăn</CardTitle>
            <CardDescription>Quản lý bàn ăn</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto">
            <Suspense>
              <div className="min-w-0 overflow-x-auto">
                <DishTable />
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

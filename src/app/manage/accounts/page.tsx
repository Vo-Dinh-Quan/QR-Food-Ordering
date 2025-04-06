import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AccountTable from "@/app/manage/accounts/account-table";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2 w-full max-w-full overflow-x-hidden">
        <Card
          className="w-full max-w-full overflow-x-auto"
          x-chunk="dashboard-06-chunk-0">
          <CardHeader className="min-w-0">
            <CardTitle>Tài khoản</CardTitle>
            <CardDescription>Quản lý tài khoản nhân viên</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto">
            <Suspense>
              <div className="min-w-0 overflow-x-auto">
                <AccountTable />
              </div>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// giải thích 1 chút là: thằng nav-item này được import vào layout public nên những page nào nằm trong thư mục public thì đều bị ảnh hưởng chuyển sang dynamic-rendering khi nav-item có sử dụng cookie từ next/headers, vậy nên chúng ta sẽ chuyển nó sang 'useClient' để dùng localStorage thay vì cookie
"use client";

import { useAppContext } from "@/components/app-provider";
import { getAccessTokenFromLocalStorage } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

const menuItems = [
  {
    title: "Món ăn",
    href: "/menu", // authRequired = undefined nghĩa là đăng nhập hay chưa đều cho hiển thị
  },
  {
    title: "Đơn hàng",
    href: "/orders",
    authRequired: true, // true nghĩa là đã đăng nhập thì mới hiển thị
  },
  {
    title: "Đăng nhập",
    href: "/login",
    authRequired: false, // false nghĩa là chưa đăng nhập thì sẽ hiển thị
  },
  {
    title: "Quản lý",
    href: "/manage/dashboard",
    authRequired: true, // true nghĩa là đã đăng nhập thì mới hiển thị
  },
];

// Server: Món ăn, Đăng nhập. Do server không biết trạng thái đăng nhập của user
// CLient: Đầu tiên client sẽ hiển thị là Món ăn, Đăng nhập.
// Nhưng ngay sau đó thì client render ra là Món ăn, Đơn hàng, Quản lý do đã check được trạng thái đăng nhập
// điều này dẫn đến warning: Content did not match. Server: "Món ăn, Đăng nhập". Client: "Món ăn, Đơn hàng, Quản lý"
// và 1 cái lỗi nữa là hydration failed, thích thì copy cái này bắn lên gpt để hiểu rõ hơn

/**
react-dom-client.development.js:4128 Uncaught Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

// paste cái này lên google: Hydration failed because the server rendered HTML didn't match the client.
// và vào link này: https://nextjs.org/docs/messages/react-hydration-error
It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.
 */

// hướng giải quyết: sử dụng useEffect để check trạng thái đăng nhập của user (theo gợi ý của nextjs)
// cách này sẽ giúp tránh lỗi hydration failed và warning Content did not match
export default function NavItems({ className }: { className?: string }) {
  const {isAuth} = useAppContext();
  return menuItems.map((item) => {
    if (
      (item.authRequired === false && isAuth) || // chưa đăng nhập thì mới hiển thị mà lại đã đăng nhập thì không hiển thị
      (item.authRequired === true && !isAuth) // đã đăng nhập thì mới hiển thị mà lại chưa đăng nhập thì không hiển thị
    )
      return null;
    return (
      <Link href={item.href} key={item.href} className={className}>
        {item.title}
      </Link>
    );
  });
}

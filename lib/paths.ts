export function isAppShellPath(pathname: string) {
  return (
    pathname.startsWith("/menu") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/order")
  );
}

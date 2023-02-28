import Link from 'next/link';

export function CustomLink({ as, href, ...otherProps }: any) {
  return (
    <>
      <Link as={as} href={href} {...otherProps}></Link>
    </>
  );
}

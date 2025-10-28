import * as React from 'react'
import { Main } from '@components/themes/layout';
import Shell from '@src/utils/shell'

export default async function Layout({
  children
}: {
  children: React.ReactNode;

}) {
  return (
    <Main>
      <Shell>
        {children}
      </Shell>
    </Main>
  );
}



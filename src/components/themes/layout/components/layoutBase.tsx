

'use client'
 import LoadingSpinner from '@components/core/Spinner';
import { LayoutContext } from '@hooks/useLayout'
import type { LayoutContextProps } from '@hooks/useLayout'
import { useAppSelector } from '@lib/redux/store'
import type { CommonProps } from '@src/@types/common'

type LayoutBaseProps = CommonProps & LayoutContextProps

const LayoutBase = (props: LayoutBaseProps) => {
  const { children, className, type } = props;

  const { data, loading, error } = useAppSelector((state) => state.appData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can replace with your custom spinner */}
       <LoadingSpinner  size={30}/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-red-600">
          {error || "Something went wrong."}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <LayoutContext.Provider value={{ type }}>
      <main className={className}>{children}</main>
    </LayoutContext.Provider>
  );
};

export default LayoutBase;

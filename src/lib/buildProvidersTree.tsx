export const buildProvidersTree = (componentsWithProps: any) => {
    const initialComponent = ({ children }: any) => <>{children}</>
    return componentsWithProps.reduce(
        (AccumulatedComponents: any, [Provider, props = {}]: any) => {
            return ({ children }: any) => {
                return (
                    <AccumulatedComponents>
                        <Provider {...props}>{children} </Provider>
                    </AccumulatedComponents>
                );
            };
        }, initialComponent);
};

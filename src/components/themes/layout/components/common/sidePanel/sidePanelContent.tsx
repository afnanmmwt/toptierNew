// 'use client'
// import ModeSwitcher from "@components/core/modeSwitcher"
// import Select from "@components/core/select"
// import Option from "@components/core/select/option"
// import { useState,ReactNode } from "react"
// import type { OptionProps as ReactSelectOptionProps } from 'react-select'
// import useDirection from '@hooks/useDirection'
// import { useChangeLocale } from "@src/utils/changeLocale"
// import { useAppSelector, useAppDispatch } from "@lib/redux/store"
// // import { setCurrency, setCountry as reduxSetCountry } from '@redux/base'
// import useLocale from "@hooks/useLocale"
// import useCurrency from "@hooks/useCurrency"
// // import useCountries from "@hooks/useCountries"




// // interface CountryOptionData {
// //     label: string
// //     value: string
// //     icon: string
// // }

// // interface CustomLabelFn {
// //     (data: CountryOptionData, label: ReactNode): ReactNode
// // }

// // interface CountryOptionProps extends ReactSelectOptionProps<CountryOptionData> {
// //     customLabel?: CustomLabelFn
// // }

// // const CountryOption: React.FC<CountryOptionProps> = (props) => (
// //     <Option
// //         {...props}
// //         customLabel={(data: CountryOptionData, label: ReactNode) => (
// //             <span className="flex items-center gap-2">
// //                 <span className="capitalize">{label}</span>
// //             </span>
// //         )}
// //     />
// // )

// // interface LanguageOptionData {
// //     label: string
// //     value: string
// // }

// // interface LanguageOptionProps extends ReactSelectOptionProps<LanguageOptionData> {
// //     customLabel?: (data: LanguageOptionData, label: ReactNode) => ReactNode
// // }

// // const LanguageOption: React.FC<LanguageOptionProps> = (props) => (
// //     <Option {...props} customLabel={(data: LanguageOptionData, label: ReactNode) => (
// //         <span className="flex items-center gap-2">
// //             <span className="uppercase">{data.value}</span>
// //             <span>{label}</span>
// //         </span>
// //     )} />
// // )

// // interface CurrencyOptionData {
// //     label: string
// //     value: string
// //     icon: string
// // }

// // interface CurrencyOptionProps extends ReactSelectOptionProps<CurrencyOptionData> {
// //     customLabel?: (data: CurrencyOptionData, label: ReactNode) => ReactNode
// // }

// // const CurrencyOption: React.FC<CurrencyOptionProps> = (props) => (
// //     <Option {...props} customLabel={(data: CurrencyOptionData, label: ReactNode) => (
// //         <span className="flex items-center gap-2">
// //             <span>{data.value}</span>
// //             <span>{label}</span>
// //         </span>
// //     )} />
// // )

// const SidePanelContent = ({ ...props }) => {
//     const { isLoading: langLoading, dict } = props
//     const currencies = useAppSelector((state) => state?.appData?.data?.currencies);
//     const languages = useAppSelector((state) => state?.appData?.data?.languages);
//     const dispatch = useAppDispatch()
//     const [, setDirectionHandler] = useDirection();
//     const { locale } = useLocale();
//     const { currency: currentCurrency } = useCurrency();


//     const languageOptions = (languages || [])
//         .filter((lang: { status: string }) => lang.status)
//         .map((lang: { name: string; language_code: string; country_id: string }) => ({
//             label: lang.name,
//             value: lang.language_code,
//         }));
//     const currencyOptions = (currencies || [])
//         .filter((currency: { status: string }) => currency.status)
//         .map((currency: { name: any; country: any }) => ({
//             label: currency.country,
//             value: currency.name,
//         }));
//     // const { countries, selectedCountry, isLoading } = useCountries();
//     // const [country, setCountry] = useState<CountryOptionData>(selectedCountry || countries[0]);
//     const [language, setLanguage] = useState<LanguageOptionData>(
//         languageOptions.find((option: { value: string }) => option.value === locale) || languageOptions[0]
//     );
//     const [currency, setcurrency] = useState<CurrencyOptionData>(
//         currencyOptions.find((option: { value: string }) => option.value === currentCurrency) || currencyOptions[0]
//     )

//     const changeLocale = useChangeLocale();

// // const handleCountryChange = (selected: CountryOptionData) => {

// //     // setCountry(selected);
// //     dispatch(reduxSetCountry(selected.value));
// // };
//     const handleLanguageChange = (value: string) => {
//         const selectedLanguage = languageOptions.find((option: { value: string }) => option.value === value)
//         if (selectedLanguage) {
//             setLanguage(selectedLanguage);
//             changeLocale(value)
//         }
//         if (value === 'ar') {
//             setDirectionHandler('rtl')
//         } else {
//             setDirectionHandler('ltr')
//         }
//     }
//     // useEffect(() => {
//     //     if (selectedCountry && selectedCountry !== country) {
//     //         setCountry(selectedCountry);
//     //     }
//     // }, [selectedCountry,country]);
//     return (
//         <div className="flex flex-col gap-y-10 mb-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h6 className="font-bold text-base">{langLoading ? <>loading...</> : dict?.sidebar?.dark_mode}</h6>
//                     <span className="text-sm font-normal text-gray-400">{langLoading ? <>loading...</> : dict?.sidebar?.dark_mode_sub}</span>
//                 </div>
//                 <ModeSwitcher />
//             </div>
//             <div className="flex flex-col gap-y-2">
//                 <h6 className="font-bold text-sm text-gray-500">{langLoading ? <>loading...</> : dict?.sidebar?.select_country}</h6>
//                 {/* <Select
//                     className="min-w-[150px] w-full"
//                     components={{ Option: CountryOption }}
//                     options={countries}
//                     size="sm"
//                     placeholder="Country"
//                     value={country}
//                   onChange={(option) => {
//     handleCountryChange(option as CountryOptionData)
// }}
//                     isSearchable
//                     isLoading={isLoading}
//                     isDisabled={isLoading}
//                 /> */}
//             </div>
//             <div className="flex flex-col gap-y-2">
//                 <h6 className="font-bold text-sm text-gray-500">{langLoading ? <>loading...</> : dict?.sidebar?.select_lang}</h6>
//                 <Select
//                     className="min-w-[150px] w-full"
//                     components={{ Option: LanguageOption }}
//                     options={languageOptions}
//                     size="sm"
//                     placeholder="Language"
//                     value={language}
//                     onChange={(option) => {
//                         handleLanguageChange((option as LanguageOptionData)?.value)

//                     }}
//                     isSearchable
//                 />
//             </div>
//             <div className="flex flex-col gap-y-2">
//                 <h6 className="font-bold text-sm text-gray-500">{langLoading ? <>loading...</> : dict?.sidebar?.select_currency}</h6>
//                 {/* <Select

//                     className="min-w-[150px] w-full"
//                     components={{ Option: CurrencyOption }}
//                     options={currencyOptions}
//                     size="sm"
//                     placeholder="Currency"
//                     value={currency}
//                     onChange={(option) => {
//                         if (option) setcurrency(option as CurrencyOptionData);
//                         dispatch(setCurrency((option as CurrencyOptionData).value))
//                     }}
//                     isSearchable
//                 /> */}
//             </div>
//         </div>
//     )
// }

// export default SidePanelContent

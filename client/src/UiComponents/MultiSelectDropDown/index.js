import React from 'react'
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push } from "../../redux/features/opentabs";

export default function
    MultiLevelDropDown({ heading, pages, groups }) {
    const style = `/* since nested groupes are not supported we have to use 
    regular css for the nested dropdowns 
 */
 li>ul                 { transform: translatex(100%) scale(0) }
 li:hover>ul           { transform: translatex(101%) scale(1) }
 li > button svg       { transform: rotate(-90deg) }
 li:hover > button svg { transform: rotate(-270deg) }

 /* Below styles fake what can be achieved with the tailwind config
    you need to add the group-hover variant to scale and define your custom
    min width style.
      See https://codesandbox.io/s/tailwindcss-multilevel-dropdown-y91j7?file=/index.html
      for implementation with config file
 */
 .group:hover .group-hover\:scale-100 { transform: scale(1) }
 .group:hover .group-hover\:-rotate-180 { transform: rotate(180deg) }
 .scale-0 { transform: scale(0) }
 .min-w-32 { min-width: 8rem }
    `;
    const dispatch = useDispatch()
    console.log(heading,"heading");

    return (
        <div className='max-h-[100px]'>
            <div className="group inline-block text-white relative z-50">
                <button
                    className="outline-none focus:outline-none px-3 py-1 rounded-sm flex items-center min-w-32"
                >
                    <span className="pr-1 text-base font-semibold flex-1">{heading}</span>
                    
                    
                    <span>
                        <svg
                            className="fill-current h-4 w-4 transform group-hover:-rotate-180 transition duration-150 ease-in-out"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                            />
                        </svg>
                    </span>
                </button>
                <ul
                    className=" bg-blue-50 text-black border border-blue-300 drop-shadow-2xl rounded-lg transform scale-0 group-hover:scale-100 absolute transition duration-150 ease-in-out origin-top min-w-[128px] p-3">
                    {groups.map(group =>
                        <li key={group?.id} className="rounded-md relative">
                            <button
                                className="w-full text-left flex items-center p-3 hover:bg-blue-200 rounded outline-none focus:outline-none"
                            >
                                <span className="pr-1 text-xs font-semibold flex-1">{group?.name}</span>
                                {console.log(group?.name,"group?.name",group?.id)
                                }
                                <span className="mr-auto">
                                    <svg
                                        className="fill-current h-4 w-4 transition duration-150 ease-in-out"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
                                        />
                                    </svg>
                                </span>
                            </button>
                            <ul className="bg-white max-h-[400px] overflow-auto tex-black border border-blue-300 drop-shadow-2xl rounded-xl absolute top-0 right-0 transition duration-150 ease-in-out origin-top-left z-50 w-60 p-3">
                                {pages.filter(page => parseInt(page.pageGroupId) === parseInt(group.id)).map(page =>
                                    <li key={page.id}
                                        onClick={() => {
                                            dispatch(push(page))
                                            secureLocalStorage.setItem(
                                                sessionStorage.getItem("sessionId") + "currentPage",
                                                page?.id
                                            );
                                        }}
                                        className="rounded-md text-xs relative font-semibold px-3 py-1.5 hover:bg-blue-200 p-3 cursor-pointer">
                                        {page?.name}
                                    </li>
                                )}
                            </ul>
                        </li>
                    )}

                </ul>
            </div>
            <style>{style}</style>
        </div>
    )
}

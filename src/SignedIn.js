import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Listbox, Transition, Combobox } from '@headlessui/react'
import { CheckIcon, CalendarDaysIcon, HandRaisedIcon, Bars3Icon, XMarkIcon, MinusSmallIcon, PlusSmallIcon, FaceSmileIcon as FaceSmileIconOutline, PaperClipIcon, DocumentPlusIcon, FolderPlusIcon, FolderIcon, HashtagIcon, } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import {
    FaceFrownIcon,
    FaceSmileIcon as FaceSmileIconMini,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/20/solid';
import AWS from 'aws-sdk';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { DotLoader } from "react-spinners";
import { eventWrapper } from '@testing-library/user-event/dist/utils';
import { useAuth } from './AuthProvider'; // Path to your AuthContext file
import SignUp from './SignUp';
import Logo from './docusync_indigo.png';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

function checkPrimaryKey(primaryKeyValue, loginToAccount) {
    const params = {
        TableName: 'financial_assistant_gpt_db',
        Key: {
            'email': primaryKeyValue
        },
    };

    dynamoDB.get(params, function (err, data) {
        if (err) {
            console.error("Error", err);
        } else {
            if (Object.keys(data).length === 0) {
                console.log("No account with that email exists.");
            } else {
                console.log("Account with that email found:", data.Item);

                if (data.Item['password'] === document.getElementById("password").value) {
                    // console.log("Password matches.");
                    const credentials = {
                        "email": data.Item['email']
                    }

                    loginToAccount(credentials);
                } else {
                    console.log("Password does not match.");
                }
            }
        }
    });
}

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Chat', href: '#' },
    { name: 'Walkthrough', href: '#' }
]

export default function SignedIn() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { authUser, login, logout } = useAuth();
    const [open, setOpen] = useState(true)

    return (
        <>
            <div className="bg-gray-900 py-24 sm:py-32 min-h-full" style={{ minHeight: '100vh' }}>
                <div className="bg-gray-900 px-6 py-24 lg:px-8 min-h-full">
                    <header className="absolute inset-x-0 top-0 z-50">
                        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                            <div className="flex lg:flex-1">
                                <a href="#" className="-m-1.5 p-1.5">
                                    <span className="sr-only">Your Company</span>
                                    <img
                                        className="h-8 w-auto"
                                        // src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                        src={Logo}
                                        alt=""
                                    />
                                </a>
                            </div>
                            <div className="flex lg:hidden">
                                <button
                                    type="button"
                                    className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
                                    onClick={() => setMobileMenuOpen(true)}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="hidden lg:flex lg:gap-x-12">
                                {navigation.map((item) => (
                                    <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-white">
                                        <Link to={"/" + item.name} >{item.name}</Link>
                                    </a>
                                ))}
                            </div>
                            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                                <a href="#" className="text-sm font-semibold leading-6 text-white">
                                    <Link to="/Log In">{authUser ? authUser['company'] : "Log In"} <span aria-hidden="true">&rarr;</span></Link>
                                </a>
                            </div>
                        </nav>
                        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                            <div className="fixed inset-0 z-50" />
                            <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
                                <div className="flex items-center justify-between">
                                    <a href="#" className="-m-1.5 p-1.5">
                                        <span className="sr-only">Your Company</span>
                                        <img
                                            className="h-8 w-auto"
                                            // src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                                            src={Logo}
                                            alt=""
                                        />
                                    </a>
                                    <button
                                        type="button"
                                        className="-m-2.5 rounded-md p-2.5 text-gray-400"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="mt-6 flow-root">
                                    <div className="-my-6 divide-y divide-gray-500/25">
                                        <div className="space-y-2 py-6">
                                            {navigation.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                                >
                                                    <Link to={"/" + item.name} >
                                                        {item.name}
                                                    </Link>
                                                </a>
                                            ))}
                                        </div>
                                        <div className="py-6">
                                            <a
                                                href="#"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                            >
                                                <Link to="/Log In">Log In</Link>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Dialog>

                    </header>

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl sm:text-center">
                            <h2 className="text-base font-semibold leading-7 text-indigo-400">{authUser.email}</h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Hey, you're signed in!</p>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                Get started by navigating to our Chat page and uploading a PDF or TXT. Then, ask away!
                            </p>
                        </div>
                    </div>



                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            onClick={logout}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

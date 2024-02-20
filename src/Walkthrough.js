import { Fragment, useState } from 'react'
import { InboxIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useAuth } from './AuthProvider'; // Path to your AuthContext file
import { Link } from 'react-router-dom';
import { Dialog, Disclosure, Listbox, Transition, Combobox } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MinusSmallIcon, PlusSmallIcon, FaceSmileIcon as FaceSmileIconOutline, PaperClipIcon, DocumentPlusIcon, FolderPlusIcon, FolderIcon, HashtagIcon, } from '@heroicons/react/24/outline';

const features = [
    {
        name: '1. Sign Up / Log In',
        description:
            'Simply select the Log In at the top right and register if you have not already, and sign in to get access to your account resources.',
        href: '#',
        icon: InboxIcon,
    },
    {
        name: '2. Account Setup',
        description:
            'This part is taken care of for you. Once you register, a custom AI will be built for you to talk to, as well as a private storage system for your account in the cloud.',
        href: '#',
        icon: UsersIcon,
    },
    {
        name: '3. Upload Documents',
        description:
            'Once signed in, navigate to the Chat page and upload documents to get started. Select and deselect which ones you want to ask questions about, write your question, and hit Post!',
        href: '#',
        icon: TrashIcon,
    },
]

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Chat', href: '#' },
    { name: 'Walkthrough', href: '#' },
    // { name: 'Health Checker', href: '#' },
    // { name: 'Contact Us', href: '#' }
]


export default function Walkthrough() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { authUser, login, logout } = useAuth();

    return (

        <div className="bg-gray-900 py-24 sm:py-32">

            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
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
                                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
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
                                        <Link to={"/" + item.name}>
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                            >
                                                {item.name}
                                            </a>
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <a
                                        href="#"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                    >
                                        Log in
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Dialog.Panel>
                </Dialog>

            </header>
            <div className="flex flex-col items-center justify-center mx-auto px-6 lg:px-8">
                <div className="text-center max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Getting Started</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Our streamline 3 step process allows you to get set up, and talking to your docs in no time.
                    </p>
                </div>
                <div className="mt-16 sm:mt-20 lg:mt-24 w-full">
                    <dl className="grid max-w-xl mx-auto grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <dt className="text-base font-semibold leading-7 text-white">
                                    {feature.name}
                                </dt>
                                <dd className="mt-1 text-base leading-7 text-gray-300">
                                    <p>{feature.description}</p>
                                    {/* <p className="mt-6">
                                        <a href={feature.href} className="text-sm font-semibold leading-6 text-indigo-400">
                                            Learn more <span aria-hidden="true">→</span>
                                        </a>
                                    </p> */}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

        </div>
    )
}

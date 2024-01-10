import { useState, React, useRef, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DotLoader } from "react-spinners";
import {
    CloudArrowUpIcon,
    FingerPrintIcon,
    DocumentTextIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'
import { ChatBubbleLeftRightIcon, CheckIcon } from '@heroicons/react/20/solid'
import screenshot from './screenshot_mvp.png';
import docusight from './3.png';
import AWS from 'aws-sdk';

const navigation = [
    // { name: 'Product', href: '#' },
    // { name: 'Features', href: '#' },
    // { name: 'Marketplace', href: '#' },
    // { name: 'Company', href: '#' },
]
const features = [
    {
        name: 'Intelligent Document Storage:',
        description:
            'Securely store your key files. Our platform provides secure storage in the cloud, so you can have easy future access and analysis of documents.',
        icon: CloudArrowUpIcon,
    },
    {
        name: 'Interactive Document Engagement:',
        description:
            'Enhance document interaction: Chat with your files like expert consultants and get AI-powered insights, all through an intuitive interface.',
        icon: DocumentTextIcon,
    },
    {
        name: 'Crystal-Clear Chat Interface:',
        description:
            'Experience seamless document interaction: Your files are displayed in our user-friendly chat interface for effortless navigation.',
        icon: ChatBubbleLeftRightIcon,
    },
    {
        name: 'Seamless Account Creation:',
        description:
            'Start smarter document management quickly with our streamlined 2 step setup, unlocking AI-driven insights in moments."',
        icon: UserGroupIcon,
    },
]
const tiers = [
    {
        name: 'Freelancer',
        id: 'tier-freelancer',
        href: '#',
        priceMonthly: '$24',
        description: 'The essentials to provide your best work for clients.',
        features: ['5 products', 'Up to 1,000 subscribers', 'Basic analytics', '48-hour support response time'],
        mostPopular: false,
    },
    {
        name: 'Startup',
        id: 'tier-startup',
        href: '#',
        priceMonthly: '$32',
        description: 'A plan that scales with your rapidly growing business.',
        features: [
            '25 products',
            'Up to 10,000 subscribers',
            'Advanced analytics',
            '24-hour support response time',
            'Marketing automations',
        ],
        mostPopular: true,
    },
    {
        name: 'Enterprise',
        id: 'tier-enterprise',
        href: '#',
        priceMonthly: '$48',
        description: 'Dedicated support and infrastructure for your company.',
        features: [
            'Unlimited products',
            'Unlimited subscribers',
            'Advanced analytics',
            '1-hour, dedicated support response time',
            'Marketing automations',
        ],
        mostPopular: false,
    },
]

// what are concerns users would have? 
// probably data privacy 
// difference between chat gpt and this 
// costs 
// setup time 

const CostTables = () => {
    const stats = [
        { name: 'Account Setup', value: 'Free', change: '+4.75%', changeType: 'positive' },
        { name: 'Document Uploads', value: 'Unlimited', change: '+54.02%', changeType: 'negative' },
        { name: 'Queries', value: 'Unlimited', change: '-1.39%', changeType: 'positive' },
        { name: 'Steps To Get Set Up', value: '2', change: '+10.18%', changeType: 'negative' },
    ]

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
                >
                    <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
                    {/* <dd
                        className={classNames(
                            stat.changeType === 'negative' ? 'text-rose-600' : 'text-gray-700',
                            'text-xs font-medium'
                        )}
                    >
                        {stat.change}
                    </dd> */}
                    <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                        {stat.value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}

const faqs = [
    {
        id: 1,
        question: "Who is this tool useful for?",
        answer:
            "Anyone who has a lot of documents they need to cross reference and find overlapping information between. This tool is especially useful for students who want to synethisize information from various sources, journalists or writers, legal professionals, and researchers / academics who need to sift through extensive literature.",
    },
    {
        id: 2,
        question: "How does this tool work exactly?",
        answer:
            "Simply upload your documents, select which ones you want to talk to, and start chatting with them! You can ask questions to multiple files at the same time and have our AI answer them for you. You can also ask for specific information from the documents, and our AI will find the most relevant information for you.",
    },
    {
        id: 3,
        question: "What's the difference between this and ChatGPT?",
        answer:
            "Our service stands out from ChatGPT in three key ways: 1) We provide a file storage system, letting users reference past documents in new chats, unlike ChatGPT's single-session document handling. 2) Our interface makes selecting and deselecting multiple files easy, offering a smoother experience than ChatGPT's more involved process. 3) Unlike ChatGPT's premium-required document upload, our platform minimizes costs and is free to use.",
    },
    {
        id: 4,
        question: "Is my data secure?",
        answer:
            "Yes, we use industry leading cloud database and storage systems provided by AWS. The same databases and storage systems used by your favorite companies such as Netflix, AirBnb, Twitch, McDonald's, and more. Your data is guaranteed to be encrypted and stored securely.",
    },
    {
        id: 5,
        question: "What are the costs?",
        answer:
            "We are committed to minimizing computational costs and, as such, offer our services free of charge through our freemium model. In a few months, we'll begin rolling out a premium version of our service that will offer additional features and functionality. However, our free version will always be available to users.",
    },

    // More questions...
]
const footerNavigation = {
    solutions: [
        { name: 'Hosting', href: '#' },
        { name: 'Data Services', href: '#' },
        { name: 'Uptime Monitoring', href: '#' },
        { name: 'Enterprise Services', href: '#' },
    ],
    support: [
        { name: 'Pricing', href: '#' },
        { name: 'Documentation', href: '#' },
        { name: 'Guides', href: '#' },
        { name: 'API Reference', href: '#' },
    ],
    company: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Jobs', href: '#' },
        { name: 'Press', href: '#' },
        { name: 'Partners', href: '#' },
    ],
    legal: [
        { name: 'Claim', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
    ],
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const sendEmail = async (email) => {
};


export default function SampleLanding() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const getStartedRef = useRef(null);
    const learnMoreRef = useRef(null);
    const scrollToSubcribe = () => getStartedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const scrollToLearnMore = () => learnMoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const [openModal, setOpenModal] = useState(false);

    AWS.config.update({
        region: 'us-east-2',
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        secretAccessKey: process.env.REACT_APP_SECRET_KEY
    });

    const handleSubscribe = async (e) => {
        e.preventDefault();
        //  prevent default
        var emailInput = document.getElementById("email-address").value;

        const lambda = new AWS.Lambda();

        const params = {
            FunctionName: 'twilioTextWithEmailLambda',
            InvocationType: 'RequestResponse', // 'Event' for async
            Payload: JSON.stringify({ email: emailInput }) // Your payload here
        };

        setOpenModal(true);

        lambda.invoke(params, (err, data) => {
            if (err) {
                console.error(err);
            }
        });
    }

    const LoadingModal = () => {
        const controller = new AbortController();

        return (
            <Transition.Root show={openModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => console.log("close")}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                    <div>
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                            <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-5">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                Congratulations, you're subscribed!
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    You'll receive a confirmation email from us within 1-2 business days, and we'll keep you updated for when we launch.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                            onClick={() => {
                                                controller.abort();
                                                setOpenModal(false);
                                            }}
                                        >
                                            Go back to landing page
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        )
    }

    const Newsletter = () => {
        return (
            <div ref={getStartedRef} className="bg-white py-16 ">
                {openModal && LoadingModal()}
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
                    <div className="max-w-xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:col-span-7">
                        <h2 className="inline sm:block lg:inline xl:block">Interested in trying it out?</h2>{' '}
                        <p className="inline sm:block lg:inline xl:block">Subscribe to get early access.</p>
                    </div>
                    <form className="w-full max-w-md lg:col-span-5 lg:pt-2" onSubmit={handleSubscribe}>
                        <div className="flex gap-x-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Enter your email"
                            />
                            <button
                                type="submit"
                                className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Subscribe
                            </button>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-900">
                            After subscribing, we'll send you updates and let you know when we officially {' '}
                            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                launch!&nbsp;
                                {/* subscribed! */}
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        )
    }


    return (
        <div className="bg-white">
            {/* Header */}
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            {/* <img
                                className="h-8 w-auto"
                                // src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                src={screenshot}
                                alt=""
                            /> */}
                        </a>
                    </div>
                    {/* <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">

                    </div> */}
                </nav>
                {/* <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                    <div className="fixed inset-0 z-50" />
                    <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <a href="#" className="-m-1.5 p-1.5">
                                <span className="sr-only">Your Company</span>
                                <img
                                    className="h-8 w-auto"
                                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                    alt=""
                                />
                            </a>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        >
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                                <div className="py-6">
                                    <a
                                        href="#"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        Log in
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Dialog.Panel>
                </Dialog> */}

                {/* <img src={docusight} style={{ width: '350px', height: '80px' }} className="h-12 w-auto" alt="" /> */}
            </header>

            <main className="isolate">
                {/* Hero section */}
                <div className="relative pt-14">
                    <div
                        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                        aria-hidden="true"
                    >

                        {/* <div
                            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                            style={{
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            }}
                        /> */}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={docusight} style={{ width: '310px', height: '69px' }} className="h-12 w-auto" alt="" />
                    </div>
                    <div className="py-24 sm:py-32">

                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center">
                                {/* add styling to the image size */}
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                    Query documents in parallel through AI.
                                </h1>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    {/* Upload and talk to multiple documents at the same time, giving you the power to cross reference them, find overlapping info, etc. through a simple chat interface allowing you to talk to the files directly. Select and deselect which documents you care to talk to, and have them saved to your account for future reference. */}
                                    Chat with multiple files to cross-reference, spot overlaps, and more. Just select or deselect documents for discussion and save them in your account for later.
                                </p>
                                <div className="mt-10 flex items-center justify-center gap-x-6">
                                    <button
                                        onClick={scrollToSubcribe}
                                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Get notified for when we launch
                                    </button>
                                    <button
                                        onClick={scrollToLearnMore}
                                        className="text-sm font-semibold leading-6 text-gray-900"
                                    >
                                        Learn more <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-16 flow-root sm:mt-24">
                                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                    <img
                                        src={screenshot}
                                        alt="App screenshot"
                                        width={2432}
                                        height={1442}
                                        className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div
                        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
                        aria-hidden="true"
                    >
                        <div
                            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                            style={{
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            }}
                        />
                    </div> */}
                </div>

                {/* Feature section */}
                <div ref={learnMoreRef} className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-indigo-600">Cross reference efficiently</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Turn Your Documents Into Interactive Knowledge Bases Using AI
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We know you want to get answers instantly. Just ask via a chat box and let our AI answer queries regarding data between your documents, organized or not.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative pl-16">
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                            <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>


                {/* Testimonial section */}
                <div className="mx-auto mt-32 max-w-7xl  sm:px-6 lg:px-8">
                    {CostTables()}
                    <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20">
                        {/* <img
                            className="absolute inset-0 h-full w-full object-cover brightness-150 saturate-0"
                            src="https://images.unsplash.com/photo-1601381718415-a05fb0a261f3?ixid=MXwxMjA3fDB8MHxwcm9maWxlLXBhZ2V8ODl8fHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1216&q=80"
                            alt=""
                        /> */}
                        <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply" />
                        <div className="absolute -left-80 -top-56 transform-gpu blur-3xl" aria-hidden="true">
                            <div
                                className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-[0.45]"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </div>
                        <div
                            className="hidden md:absolute md:bottom-16 md:left-[50rem] md:block md:transform-gpu md:blur-3xl"
                            aria-hidden="true"
                        >
                            <div
                                className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-r from-[#ff4694] to-[#776fff] opacity-25"
                                style={{
                                    clipPath:
                                        'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                }}
                            />
                        </div>
                        <div className="relative mx-auto max-w-2xl lg:mx-0">
                            {/* <img className="h-12 w-auto" src="https://tailwindui.com/img/logos/workcation-logo-white.svg" alt="" /> */}
                            <figure>
                                <blockquote className="mt-6 text-lg font-semibold text-white sm:text-xl sm:leading-8">
                                    <p>
                                        "Utilizing DocuSight AI has significantly transformed my research process, especially when working with extensive collections of academic papers. Its ability to facilitate efficient cross-referencing and fact-checking through intuitive queries is remarkable. This tool not only enhances the accuracy of my work but also substantially saves time by revealing correlations between various documents with ease."
                                    </p>
                                </blockquote>
                                <figcaption className="mt-6 text-base text-white">
                                    <div className="font-semibold">Victor R.</div>
                                    <div className="mt-1">Harvard Medical School Graduate, M.D.</div>
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </div>

                {/* FAQs */}
                <div className="mx-auto max-w-2xl divide-y divide-gray-900/10 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:pb-32">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900 py-4 ">Frequently asked questions</h2>
                    <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                                <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">{faq.question}</dt>
                                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                                    <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
                {Newsletter()}
            </main>
        </div>
    )
}

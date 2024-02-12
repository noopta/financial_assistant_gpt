import { Fragment, useState, useRef } from 'react'
import { Dialog, Disclosure, Listbox, Transition, Combobox } from '@headlessui/react'
import { CheckIcon, CalendarDaysIcon, HandRaisedIcon, Bars3Icon, XMarkIcon, MinusSmallIcon, PlusSmallIcon, FaceSmileIcon as FaceSmileIconOutline, PaperClipIcon, DocumentPlusIcon, FolderPlusIcon, FolderIcon, HashtagIcon, } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import {
    FaceFrownIcon,
    FaceSmileIcon as FaceSmileIconMini,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/20/solid';
import AWS from 'aws-sdk';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { DotLoader } from "react-spinners";
import { eventWrapper } from '@testing-library/user-event/dist/utils';
import { AuthProvider, useAuth } from './AuthProvider'; // Path to your AuthContext file

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

function checkPrimaryKey(primaryKeyValue, login) {
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
                    console.log("Password matches.");
                    console.log(data.Item)
                    const credentials = {
                        "email": data.Item['email'],
                        "company": data.Item['company'],
                        "firstName": data.Item['firstName'],
                        "lastName": data.Item['lastName'],
                        // "country": data.Item['country'],
                        // "city": data.Item['city'],
                        "account_type": data.Item['account_type'],
                        "bucket_name": data.Item['bucket_name'],
                        "assistant_name": data.Item['assistant_name'],
                        "assistant_id": data.Item['assistant_id']
                    }

                    console.log("credentialss: ", credentials);

                    login(credentials);
                } else {
                    console.log("Password does not match.");
                }
            }
        }
    });
}

const addUserToDynamoDB = async (userInfo) => {
    const params = {
        TableName: "financial_assistant_gpt_db",
        Item: {
            // Your item's attributes
            "email": userInfo.email,
            "firstName": userInfo.firstName,
            "lastName": userInfo.lastName,
            "company": userInfo.company,
            "password": userInfo.password,
            // "country": userInfo.country,
            // "city": userInfo.city
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log("Item added successfully");
    } catch (error) {
        console.error("Error adding item:", error);
    }
};

const createUserS3Bucket = async (userInfo) => {
    const params = {
        Bucket: userInfo.email + "_bucket",
        CreateBucketConfiguration: {
            LocationConstraint: 'us-east-2' // e.g., 'us-west-2'
        }
    };

    try {
        const data = await s3.createBucket(params).promise();
        console.log('Bucket Created Successfully', data.Location);
    } catch (err) {
        console.log('Error', err);
    }
}

const createUserS3Folders = (userInfo) => {
    var chatFolderName = "chatFolder/";
    var newsLetterFolderName = "newsletterFolder/";

    s3.putObject({
        Bucket: userInfo.email + "_bucket",
        Key: chatFolderName
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully created folder");
        }
    });

    s3.putObject({
        Bucket: userInfo.email + "_bucket",
        Key: newsLetterFolderName
    }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully created folder");
        }
    });
}

const registerUser = async (userInfo, setOpenModal) => {
    // here we want to create an S3 bucket for the user
    // add them to the dynamo DB table 
    console.log("yo")

    userInfo["firstName"] = userInfo["firstName"].replace(/\s/g, "");
    userInfo["lastName"] = userInfo["lastName"].replace(/\s/g, "");
    userInfo["bucket_name"] = userInfo["bucket_name"].replace(/\s/g, "");
    userInfo["bucket_name"] = userInfo["bucket_name"].replace("@", "-");
    userInfo["bucket_name"] = userInfo["bucket_name"].replace(".", "-");
    userInfo["bucket_name"] = userInfo["bucket_name"].replace("_", "-");
    const response = await fetch('https://docusync.ai/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userInfo }),
    });

    const data = await response.json();
    setOpenModal(false);

    if (data["result"] != "success") {
        // close modal 
        alert("Error: " + data["result"]);
    }

    console.log(data); // { text: 'Hello, World!' }
    // addUserToDynamoDB(userInfo)
    // create a folder in the S3 bucket for them 
    // createUserS3Bucket(userInfo);
    // createUserS3Folders(userInfo);
    // for chat interface files
    // and create another folder in the S3 bucket for them

    // for health checker files
}

const checkInfoValidity = (userInfo) => {
    if (userInfo['firstName'].length == 0) {
        return "empty first name";
    }

    if (userInfo['lastName'].length == 0) {
        return "empty last name";
    }

    if (userInfo['email'].length == 0) {
        return "empty email";
    }

    if (!userInfo['email'].includes('@')) {
        return "invalid email";
    }

    if (userInfo['password'].length == 0) {
        return "empty password";
    }

    if (userInfo['password'].length < 8) {
        return "invalid password length";
    }

    if (userInfo['password'] != userInfo['retypePassword']) {
        return "unmatching passwords";
    }

    return "success";
}

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Chat', href: '#' },
    { name: 'Walkthrough', href: '#' }
]



export default function LogIn() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { authUser, login, logout } = useAuth();
    const cancelButtonRef = useRef(null)
    const [open, setOpen] = useState(false);
    const [thisOpen, setThisOpen] = useState(false);
    const [signUpError, setSignUpError] = useState(false);
    const [signUpErrorMessage, setSignUpErrorMessage] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const handleSubmit = (event) => {
        console.log("yo");

        checkPrimaryKey(event.target.email.value, login);
    }

    const LoginFormErrorNotification = () => {
        return (
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Whoops!{' '}
                            <a href="#" className="font-medium text-yellow-700 underline hover:text-yellow-600">
                                {signUpErrorMessage}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const RegistrationForm = (thisSetOpen) => {
        let errorMap = new Map();

        errorMap['empty email'] = 'Please enter an email.';
        errorMap['empty first name'] = 'Please enter your first name';
        errorMap['empty last name'] = 'Please enter your last name';
        errorMap['invalid email'] = 'Please enter a valid email address';
        errorMap['empty password'] = 'Please enter a password';
        errorMap['invalid password length'] = 'Please enter a password with >= 8 characters.';
        errorMap['umatching passwords'] = 'Please enter matching passwords';

        return (
            <form onSubmit={(e) => {
                e.preventDefault();
                thisSetOpen(false);
                setOpenModal(true);
                console.log("at form submit");
                var userInfo = {
                    "email": document.getElementById("signUpEmail").value,
                    "firstName": document.getElementById("first-name").value,
                    "lastName": document.getElementById("last-name").value,
                    "company": document.getElementById("company-name").value,
                    "password": document.getElementById("signUpPassword").value,
                    "retypePassword": document.getElementById("retypePassword").value,
                    // "country": document.getElementById("country").value,
                    // "city": document.getElementById("city").value,
                    "account_type": "free",
                    "bucket_name": document.getElementById("signUpEmail").value + "_bucket",
                    "assistant_name": document.getElementById("signUpEmail").value + "Financial Assistant"
                };

                let formValidityResponse = checkInfoValidity(userInfo);

                console.log(formValidityResponse);
                console.log(errorMap);

                if (formValidityResponse != "success") {
                    let errorMessage = errorMap[formValidityResponse];
                    setSignUpErrorMessage(errorMessage);
                    setSignUpError(true);

                    console.log(errorMessage);
                    return errorMessage;
                }

                // make a post request to the backend to add the user to the database

                registerUser(userInfo, setOpenModal);
            }}>
                <div className="space-y-12">
                    <div className="border-b border-white/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-white">Personal Information</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-400">Use a permanent address where you can receive mail.</p>
                        {signUpError && LoginFormErrorNotification()}
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-white">
                                    First name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="given-name"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-white">
                                    Last name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="last-name"
                                        id="last-name"
                                        autoComplete="family-name"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="signUpEmail"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-white">
                                    Company Name
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="company-name"
                                        id="company-name"
                                        autoComplete="text"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-white">
                                    Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        name="first-name"
                                        id="signUpPassword"
                                        autoComplete="password"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-white">
                                    Re-type Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="password"
                                        name="password"
                                        id="retypePassword"
                                        autoComplete="password"
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm font-semibold leading-6 text-white">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        Sign up
                    </button>
                </div>
            </form>
        );
    }


    const LoadingModal = ({ openModal, setOpenModal }) => {
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
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center ">
                                            <DotLoader color="#36d7b7" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-5">

                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Hold on, we're signing you up...
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
                                            Close Modal
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


    const SignUp = ({ thisOpen, thisSetOpen }) => {
        // const [thisOpen, thisSetOpen] = useState(false);
        const thisCancelButtonRef = useRef(null);

        const handleClick = () => {
            thisSetOpen(false);
            // setParentOpen(false);
        }
        return (
            <Transition.Root show={thisOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" initialFocus={thisCancelButtonRef} onClose={thisSetOpen}>
                    <Transition.Child
                        as="div"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" /> {/* Dark Background */}
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"> {/* Dark Panel */}
                                    <div>

                                        <div className="mt-3 text-center sm:mt-5">
                                            <div className="mt-2">
                                                {RegistrationForm(thisSetOpen)} {/* Ensure RegistrationForm also supports dark mode */}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        )
    }

    return (
        <>
            <div className="bg-gray-900 px-6 py-24 lg:px-8">
                {/* <LoadingModal openModal={openModal} setOpenModal={setOpenModal} /> */}
                {openModal && <LoadingModal openModal={openModal} setOpenModal={setOpenModal} />}
                {thisOpen && <SignUp thisOpen={thisOpen} thisSetOpen={setThisOpen} />}

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
                                <Link to="/Log In">Log in <span aria-hidden="true">&rarr;</span> </Link>
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
                                            <Link to={item.name}>
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

                <div className="  flex min-h-full flex-1 flex-col justify-center px-6 py-4 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            className="mx-auto h-10 w-auto"
                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                            alt="Your Company"
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                            Sign in to your account
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6" action="#" onSubmit={(event) => {
                            event.preventDefault();
                            handleSubmit(event)
                        }}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    Sign in
                                </button>
                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm text-gray-400">
                            Not a member?{' '}
                            <a onClick={() => { setThisOpen(true) }} href="#" className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
                                Sign Up Here
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

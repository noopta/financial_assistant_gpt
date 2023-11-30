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


pdfjsLib.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.mjs';

AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Chat', href: '#' },
    { name: 'Health Checker', href: '#' },
    { name: 'Contact Us', href: '#' }
]

const moods = [
    { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
    { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
    { name: 'Happy', value: 'happy', icon: FaceSmileIconMini, iconColor: 'text-white', bgColor: 'bg-green-400' },
    { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
    { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
    { name: 'I feel nothing', value: null, icon: XMarkIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
]

const sendResponseToBackend = async (query) => {
    // send a request to our backend to retrieve the S3 files and run the GPT-4 model
    const response = await fetch('http://127.0.0.1:5000/post-endpoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query }),
    });

    const data = await response.json();

    console.log(data); // { text: 'Hello, World!' }
    return data;
}

export default function Chat() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [text, setText] = useState('');
    const [faqs, setFaqs] = useState([]);
    const { authUser, login, logout } = useAuth();


    const handleFileChange = (event) => {
        // Filter out non-PDF files
        const pdfFiles = Array.from(event.target.files).filter(file => file.type === 'application/pdf' || file.type === 'text/plain');
        setSelectedFiles(pdfFiles);
    };

    const promises = [];
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false); // Use this state to control the modal

    const handleUpload = async () => {

        var numUploads = 0;
        const numFiles = selectedFiles.length;

        for (let file of selectedFiles) {
            const reader = new FileReader();
            const fileType = file.type;

            const filePromise = new Promise((resolve, reject) => {
                reader.onload = async (e) => {
                    try {
                        if (fileType === 'text/plain') {
                            const text = (e.target.result);
                            console.log(text);

                            await sendDataToS3("financial-assistant-gpt-bucket", file.name, text);
                            resolve(); // Resolve the promise after upload

                        } else {
                            const data = e.target.result;
                            const loadingTask = pdfjsLib.getDocument({ data });
                            const pdf = await loadingTask.promise;
                            const textContents = [];

                            for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                                const textContent = await page.getTextContent();

                                textContents.push(textContent.items.map(item => item.str).join(' '));
                            }

                            console.log(textContents.join('\n')); // Extracted text
                            const newFileName = file.name.replace(".pdf", ".txt");

                            await sendDataToS3("financial-assistant-gpt-bucket", newFileName, textContents.join('\n'));
                            resolve(); // Resolve the promise after upload

                        }
                    } catch (error) {
                        console.error('Error processing file', error);
                        reject(error); // Reject the promise if there's an error
                    }
                };
                reader.readAsArrayBuffer(file);
            });

            promises.push(filePromise);
        }

        Promise.all(promises).then(() => {
            // if (promises.length > 0) {
            console.log("All uploads completed");
            uploadFilesToAssistant();
            // TODO: You should figure out the content to be sent based on all uploaded files.
            // For example, you might want to concatenate the names of files or any identifiers which were just uploaded.
            const text = "All files have been processed and uploaded"; // Provide actual content here
            console.log(text)
            // }
        }).catch((error) => {
            console.error("Error occurred while uploading files", error);
            // Handle any error that occurred during processing or uploading files
        });
    };

    const uploadFilesToAssistant = async () => {
        // send a request to our backend to retrieve the S3 files and run the GPT-4 model
        const response = await fetch('http://127.0.0.1:5000/upload-files');

        const data = await response.json();

        console.log(data); // { text: 'Hello, World!' }
    }
    const sendDataToS3 = (bucketName, fileName, content) => {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: content
        };

        return new Promise((resolve, reject) => {
            s3.putObject(params, (err, data) => {
                if (err) {
                    console.error('Error', err);
                    reject(err);
                } else {
                    console.log('Success');
                    resolve(data);
                }
            });
        });
    }

    const GenerateRow = async (faqs, setFaqs, newRowQuestion, isModalOpen, setModalOpen) => {
        // gotta make the backend API call here
        // make program wait until the response is received
        setModalOpen(true);
        const response = await sendResponseToBackend(newRowQuestion);
        setModalOpen(false);

        function formatTextToHTML(text) {
            const formattedText = text
                .replace(/\n/g, '<br>') // Replace line breaks with <br>
                .replace(/\*\*/g, '') // Optionally handle other markdown-like formatting
            // Add more replacements as needed

            return formattedText;
        }

        setFaqs(prevFaqs => [...prevFaqs, {
            question: newRowQuestion,
            answer: formatTextToHTML(response['answer']),
        }]);
        console.log("yo")

    }

    function InputTextBox(faqs, setFaqs, text, setText, isModalOpen, setModalOpen) {
        const [selected, setSelected] = useState(moods[5]);

        const handleTextChange = (event) => {
            setText(event.target.value);
        };

        return (
            <div style={{ paddingTop: '20px' }} className="flex items-start space-x-4 ">

                <div className="min-w-0 flex-1">
                    <form onSubmit={(e) => { e.preventDefault(); GenerateRow(faqs, setFaqs, text, isModalOpen, setModalOpen); }}>
                        <div className="border-b dark:border-gray-200 focus-within:border-indigo-600 dark:border-gray-700 dark:focus-within:border-indigo-400">
                            <textarea
                                rows={3}
                                name="comment"
                                id="comment"
                                onChange={handleTextChange}
                                // className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 dark:text-gray-900 placeholder:dark:text-gray-400 focus:border-indigo-600 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-indigo-400"
                                className="w-full border-0 bg-transparent pl-11 pr-4 text-white focus:ring-0 sm:text-sm textarea-focus-outline-none"
                                placeholder="What are you curious about? (e.g. I'm dealing with feelings of jealousy from my friends, how do I deal with this?)"
                                defaultValue={''}
                            />
                        </div>
                        <div className="flex justify-between pt-2">
                            <div className="flex items-center space-x-5">
                                <div className="flow-root">

                                </div>
                                {/* The Listbox component goes here with its own dark mode classes */}
                            </div>
                            <div className="flex-shrink-0">
                                <button
                                    type="submit"
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        )
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
            <LoadingModal openModal={isModalOpen} setOpenModal={setModalOpen} />
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
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                                        >
                                            {item.name}
                                        </a>
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
            <div className="bg-gray-900 py-16 sm:py-24 lg:py-32">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
                    <div className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:col-span-7">
                        <h2 className="inline sm:block lg:inline xl:block">Ready to talk to your finances?</h2>{' '}
                        <p className="inline sm:block lg:inline xl:block">Upload documents and get started.</p>
                    </div>
                    <form className="w-full max-w-md lg:col-span-5 lg:pt-2" onSubmit={handleFormSubmit}>
                        <div className="flex gap-x-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                accept="application/pdf, text/plain"
                                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                            <button
                                onClick={() => handleUpload()}
                                type="submit"
                                className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Upload
                            </button>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-300">
                            We care about your data. Read our{' '}
                            <a href="#" className="font-semibold text-white">
                                privacy&nbsp;policy
                            </a>
                            .
                        </p>
                    </form>
                </div>
            </div>

            {/* TextInput section */}
            <div className="bg-gray-900">
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-4xl divide-y divide-white/10">
                        <h2 style={{ marginBottom: '20px' }} className="text-2xl font-bold leading-10 tracking-tight text-white">Your conversation</h2>
                        {InputTextBox(faqs, setFaqs, text, setText, isModalOpen, setModalOpen)}
                        <dl className="mt-10 space-y-6 divide-y divide-white/10">
                            {faqs.map((faq) => (
                                <Disclosure as="div" key={faq.question} className="pt-6">
                                    {({ open }) => (
                                        <>
                                            <dt>
                                                <Disclosure.Button className="flex w-full items-start justify-between text-left text-white">
                                                    <span className="text-base font-semibold leading-7">{faq.question}</span>
                                                    <span className="ml-6 flex h-7 items-center">
                                                        {open ? (
                                                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                                                        ) : (
                                                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                                                        )}
                                                    </span>
                                                </Disclosure.Button>
                                            </dt>
                                            <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                                <p dangerouslySetInnerHTML={{ __html: faq.answer }} className="text-base leading-7 text-gray-300"></p>
                                            </Disclosure.Panel>
                                        </>
                                    )}
                                </Disclosure>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
            {/* <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Get Querying</h2>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                    First, upload the financial documents and files you want to query against. Then, start chatting with our AI for insights!
                </p>
            </div> */}
        </div>
    )
}

const LoadingModal = ({ openModal, setOpenModal }) => {
    return (
        <Transition.Root show={openModal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setOpenModal}>
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
                                        {/* <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            Payment successful
                                        </Dialog.Title> */}

                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Fetching response, one sec!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        onClick={() => setOpenModal(false)}
                                    >
                                        Go back to dashboard
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
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Listbox, Transition, Combobox } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MinusSmallIcon, PlusSmallIcon, FaceSmileIcon as FaceSmileIconOutline, PaperClipIcon, DocumentPlusIcon, FolderPlusIcon, FolderIcon, HashtagIcon, } from '@heroicons/react/24/outline'
import {
    FaceFrownIcon,
    FaceSmileIcon as FaceSmileIconMini,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/20/solid'
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import InformationSection from './InformationSection'
import AWS from 'aws-sdk';
import './App.css'; // Make sure to include the CSS file in the same directory

pdfjsLib.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.mjs';

AWS.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const navigation = [
    { name: 'About', href: '#' },
    { name: 'Contact Us', href: '#' }
]

// const faqs = [
//     {
//         question: "What's the best thing about Switzerland?",
//         answer:
//             "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
//     },
//     // More questions...
// ]

const moods = [
    { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
    { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
    { name: 'Happy', value: 'happy', icon: FaceSmileIconMini, iconColor: 'text-white', bgColor: 'bg-green-400' },
    { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
    { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
    { name: 'I feel nothing', value: null, icon: XMarkIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function GenerateRow(faqs, setFaqs, newRowQuestion) {
    // gotta make the backend API call here



    setFaqs(prevFaqs => [...prevFaqs, {
        question: newRowQuestion,
        answer: "",
    }]);
    console.log("yo")

}


function InputTextBox(faqs, setFaqs, text, setText) {
    const [selected, setSelected] = useState(moods[5]);

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    return (
        <div style={{ paddingTop: '20px' }} className="flex items-start space-x-4 ">

            <div className="min-w-0 flex-1">
                <form onSubmit={(e) => { e.preventDefault(); GenerateRow(faqs, setFaqs, text); }}>
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

function FileInput() {
    return (
        <div>
            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300" for="multiple_files">Upload multiple files</label>
            <input class="block w-full text-sm text-gray-900 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" id="multiple_files" type="file" multiple />
        </div>
    );
}

function FileUploader() {

    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleUpload = async () => {
        var numUploads = 0;

        for (let file of selectedFiles) {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = e.target.result;
                try {
                    const loadingTask = pdfjsLib.getDocument({ data });
                    const pdf = await loadingTask.promise;
                    const textContents = [];

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();

                        textContents.push(textContent.items.map(item => item.str).join(' '));
                    }

                    // here we want to send the textContent to the backend to S3
                    console.log(textContents.join('\n')); // Extracted text

                    // get PDF name and store it to a variable 

                    const newFileName = file.name.replace(".pdf", ".txt");

                    numUploads += sendDataToS3("financial-assistant-gpt-bucket", newFileName, textContents.join('\n'));

                } catch (error) {
                    console.error('Error processing PDF', error);
                }
            };

            if (numUploads == selectedFiles.length) {
                // all files have been uploaded 
                // send a request to our backend to retrieve the S3 files and run the GPT-4 model
                sendResponseToBackend();
            } else {
                // some files have not been uploaded yet
            }

            reader.readAsArrayBuffer(file);
        }
    };

    const sendResponseToBackend = async () => {
        // send a request to our backend to retrieve the S3 files and run the GPT-4 model
        // const response = await fetch('http://localhost:5000/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ text: 'Hello, World!' }),
        // });

        // const data = await response.json();

        // console.log(data); // { text: 'Hello, World!' }
    }

    const sendDataToS3 = async (bucketName, fileName, content) => {
        // financial-assistant-gpt-bucket

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: content
        };

        try {
            const data = await s3.putObject(params).promise();
            console.log('Success', data);
            return 1;
        } catch (error) {
            console.log('Error', error);
            return 0;
        }
    }

    const handleFileChange = (event) => {
        // Filter out non-PDF files
        const pdfFiles = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
        setSelectedFiles(pdfFiles);
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} multiple accept="application/pdf" />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}


export default function Example() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [text, setText] = useState('');
    const [faqs, setFaqs] = useState([
        {
            question: "What's the best thing about Switzerland?",
            answer: "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
        },
        // More questions...
    ]);

    return (
        <div className="bg-gray-900">
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
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <a href="#" className="text-sm font-semibold leading-6 text-white">
                            Log in <span aria-hidden="true">&rarr;</span>
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

            <div className="relative isolate pt-14">
                <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                                Your personal financial analyst.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-300">
                                Financial Insight is an interactive chatbot that helps you analyze and derive insights from financial documents such as earnings reports, balance sheets, and more.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <a
                                    href="#"
                                    className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                                >
                                    Get started
                                </a>
                                <a href="#" className="text-sm font-semibold leading-6 text-white">
                                    Learn more <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>

                        <InformationSection />

                        {/* {FileInput()} */}
                        {FileUploader()}

                        {/* FAQS */}

                        <div className="bg-gray-900">
                            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
                                <div className="mx-auto max-w-4xl divide-y divide-white/10">
                                    <h2 style={{ marginBottom: '20px' }} className="text-2xl font-bold leading-10 tracking-tight text-white">Your conversation</h2>
                                    {InputTextBox(faqs, setFaqs, text, setText)}
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
                                                            <p className="text-base leading-7 text-gray-300">{faq.answer}</p>
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        </div>
                        {/* <img
                            src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                            alt="App screenshot"
                            width={2432}
                            height={1442}
                            className="mt-16 rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10 sm:mt-24"
                        /> */}
                    </div>
                </div>
            </div>
        </div >
    )
}

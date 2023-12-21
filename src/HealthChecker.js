
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Listbox, Transition, Combobox } from '@headlessui/react'
import { CheckIcon, CalendarDaysIcon, HandRaisedIcon, Bars3Icon, XMarkIcon, MinusSmallIcon, PlusSmallIcon, FaceSmileIcon as FaceSmileIconOutline, PaperClipIcon, DocumentPlusIcon, FolderPlusIcon, FolderIcon, HashtagIcon, } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { useAuth } from './AuthProvider'; // Path to your AuthContext file
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import AWS from 'aws-sdk';

pdfjsLib.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.mjs';
const s3 = new AWS.S3();

const navigation = [
    { name: 'Home', href: '#' },
    { name: 'Chat', href: '#' },
    { name: 'Health Checker', href: '#' },
    { name: 'Contact Us', href: '#' }
]

const features = [
    {
        name: 'Push to deploy',
        description:
            'Commodo nec sagittis tortor mauris sed. Turpis tortor quis scelerisque diam id accumsan nullam tempus. Pulvinar etiam lacus volutpat eu. Phasellus praesent ligula sit faucibus.',
        href: '#',
        icon: CloudArrowUpIcon,
    },
    {
        name: 'SSL certificates',
        description:
            'Pellentesque enim a commodo malesuada turpis eleifend risus. Facilisis donec placerat sapien consequat tempor fermentum nibh.',
        href: '#',
        icon: LockClosedIcon,
    },
    {
        name: 'Simple queues',
        description:
            'Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.',
        href: '#',
        icon: ArrowPathIcon,
    },
]



const NewsletterAbout = () => {
    return (
        <div className="bg-gray-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-400">Monitor efficiently</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        All you need to keep track of the progess of your business ventures.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        Keeping track of all aspects of your business, e.g. project metrics, employee sales, inventory, etc. can be a hassle. That's why we've created a recurring AI powered tracker to monitor them for you.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                                    <feature.icon className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                                    <p className="flex-auto">{feature.description}</p>
                                    <p className="mt-6">
                                        <a href={feature.href} className="text-sm font-semibold leading-6 text-indigo-400">
                                            Learn more <span aria-hidden="true">→</span>
                                        </a>
                                    </p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}


export default function HealthChecker() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { authUser, login, logout } = useAuth();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const promises = [];
    const [text, setText] = useState("");
    const [topics, setTopics] = useState([]);

    const handleFileChange = (event) => {
        // Filter out non-PDF files
        const pdfFiles = Array.from(event.target.files).filter(file => file.type === 'application/pdf' || file.type === 'text/plain');
        setSelectedFiles(pdfFiles);
    };
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

    const GenerateTopic = async (topics, setTopics, newTopic) => {
        // gotta make the backend API call here
        // make program wait until the response is received
        // Trigger state update
        setTopics(prevTopics => [...prevTopics, newTopic]);
        // Set newTopic for useEffect to react
    }

    function InputTextBox(topics, setTopics, text, setText, isModalOpen, setModalOpen) {
        const handleTextChange = (event) => {
            setText(event.target.value);
        };

        return (
            <div style={{ paddingTop: '20px' }} className="flex items-start space-x-4 ">

                <div className="min-w-0 flex-1">
                    <form onSubmit={(e) => { e.preventDefault(); GenerateTopic(topics, setTopics, text); }}>
                        <div className="border-b dark:border-gray-200 focus-within:border-indigo-600 dark:border-gray-700 dark:focus-within:border-indigo-400">
                            <textarea
                                rows={3}
                                name="comment"
                                id="comment"
                                onChange={handleTextChange}
                                // className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 dark:text-gray-900 placeholder:dark:text-gray-400 focus:border-indigo-600 focus:ring-0 sm:text-sm sm:leading-6 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-indigo-400"
                                className="w-full border-0 bg-transparent pl-11 pr-4 text-white focus:ring-0 sm:text-sm textarea-focus-outline-none"
                                placeholder="What do you want to keep track of? (e.g. chocolate cupcake inventory, employee sales, customer conversion)"
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
    };

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    const sendTopicsToBackend = async () => {
        // create a POST request to send the topics to the backend
        // send a request to our backend to retrieve the S3 files and run the GPT-4 model

        const response = await fetch('http://127.0.0.1:5000/uploadTopics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: topics }),
        });

        const data = await response.json();

        console.log(data); // { text: 'Hello, World!' }
        return data;
    }

    return (
        <div className="bg-gray-900 px-6 lg:px-8">
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

            <NewsletterAbout />

            <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
                <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Start tailoring your newsletter.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
                    First, upload any files you want to be processed by our AI. Then, enter any topics you want to keep track of. Finally, click "Create Newsletter", and wait for your first email to be sent out.
                </p>

                {/*  */}
                <form className="mx-auto mt-10 flex max-w-md gap-x-4">

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
                            className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                        />
                        <button
                            onClick={() => handleUpload()}
                            type="submit"
                            className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                            Upload
                        </button>
                    </div>
                </form>
                {InputTextBox(topics, setTopics, text, setText, null, null)}

                <div>
                    <h2 className="text-sm font-medium text-gray-500">Your Topics</h2>
                    <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {topics.map((topic) => (
                            <li key={topic} className="col-span-1 flex rounded-md shadow-sm">
                                <div
                                    className={classNames(
                                        'bg-indigo-600',
                                        'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white'
                                    )}
                                >
                                </div>
                                <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                                    <div className="flex-1 truncate px-4 py-2 text-sm">
                                        <a href="" className="font-medium text-gray-900 hover:text-gray-600">
                                            {topic}
                                        </a>
                                        {/* <p className="text-gray-500">{topic} Members</p> */}
                                    </div>
                                    <div className="flex-shrink-0 pr-2">
                                        <button
                                            type="button"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            <span className="sr-only">Open options</span>
                                            {/* <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" /> */}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onSubmit={(e) => { e.preventDefault(); sendTopicsToBackend(); }}
                        className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        Create Newsletter
                    </button>
                </div>
            </div>


        </div>

    )
}

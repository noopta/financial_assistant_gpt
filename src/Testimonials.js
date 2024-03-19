export default function Testimonials() {
    return (
        <div>
            <section className="bg-gray-900 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="flex flex-col pb-10 sm:pb-16 lg:pb-0 lg:pr-8 xl:pr-20">
                            {/* <img className="h-12 self-start" src="https://tailwindui.com/img/logos/tuple-logo-white.svg" alt="" /> */}
                            <figure className="mt-10 flex flex-auto flex-col justify-between">
                                <blockquote className="text-lg leading-8 text-white">
                                    <p>
                                        “As an individual who frequently receives and manages a significant volume of PDF documents from my executive team, DocuSync offers a substantial efficiency improvement, optimizing valuable time within my constrained schedule. By utilizing DocuSync, I am able to efficiently locate and extract pertinent information from billing documents by simply requesting the relevant topics, thereby streamlining the process of obtaining the necessary data.”
                                    </p>
                                </blockquote>
                                <figcaption className="mt-10 flex items-center gap-x-6">
                                    {/* <img
                                        className="h-14 w-14 rounded-full bg-gray-800"
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt=""
                                    /> */}
                                    <div className="text-base">
                                        <div className="font-semibold text-white">Shuv I.</div>
                                        <div className="mt-1 text-gray-400">CEO of Stragic Retail Partners</div>
                                    </div>
                                </figcaption>
                            </figure>
                        </div>
                        <div className="flex flex-col pb-10 sm:pb-16 lg:pb-0 lg:pr-8 xl:pr-20">
                            {/* <img className="h-12 self-start" src="https://tailwindui.com/img/logos/tuple-logo-white.svg" alt="" /> */}
                            <figure className="mt-10 flex flex-auto flex-col justify-between">
                                <blockquote className="text-lg leading-8 text-white">
                                    <p>
                                        “Utilizing DocuSync AI has significantly transformed my research process, especially when working with extensive collections of academic papers. Its ability to facilitate efficient cross-referencing and fact-checking through intuitive queries is remarkable. This tool not only enhances the accuracy of my work but also substantially saves time by revealing correlations between various documents with ease.”
                                    </p>
                                </blockquote>
                                <figcaption className="mt-10 flex items-center gap-x-6">
                                    {/* <img
                                        className="h-14 w-14 rounded-full bg-gray-800"
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt=""
                                    /> */}
                                    <div className="text-base">
                                        <div className="font-semibold text-white">Victor R.</div>
                                        <div className="mt-1 text-gray-400">M.D. & Harvard Medical School Graduate</div>
                                    </div>
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

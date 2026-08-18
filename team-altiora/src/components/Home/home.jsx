import React from 'react'

export default function Home() {
    return (
        <div className="px-2 py-32 bg-white">
            <div className="container m-auto px-6 text-gray-600 md:px-12 xl:px-6">
                <div className="space-y-6 md:space-y-0 md:flex md:gap-6 lg:items-center lg:gap-12">
                    <div className="md:5/12 lg:w-5/12">
                        <img
                            src="https://tailus.io/sources/blocks/left-image/preview/images/startup.png"
                            alt="home"
                        />
                    </div>
                    <div className="md:7/12 lg:w-6/12">
                        <h2 className="text-2xl text-gray-900 font-bold md:text-4xl">
                            Welcome to Team Altiora
                        </h2>
                        <p className="mt-6 text-gray-600">
                            This is the home page of our amazing project.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

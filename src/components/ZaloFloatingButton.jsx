import React, { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { getAllBranches } from '../data/branchData';

/**
 * Floating Zalo button component - displays at bottom right corner
 * Shows dropdown with showroom list when clicked
 */
export default function ZaloFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const branches = getAllBranches();

    const handleZaloClick = (zaloPhone) => {
        // Format: https://zalo.me/PHONENUMBER
        const zaloUrl = `https://zalo.me/${zaloPhone}`;
        window.open(zaloUrl, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden min-w-[280px] animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-blue-600 text-white px-4 py-3">
                        <h3 className="font-semibold text-sm">Liên hệ qua Zalo</h3>
                        <p className="text-xs text-blue-100 mt-0.5">Chọn showroom để nhắn tin</p>
                    </div>
                    <div className="py-2">
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                onClick={() => handleZaloClick(branch.zaloPhone)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                        {branch.shortName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {branch.zaloPhone}
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" viewBox="0 0 48 48" fill="currentColor">
                                    <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm0 36c-8.822 0-16-7.178-16-16S15.178 8 24 8s16 7.178 16 16-7.178 16-16 16z"/>
                                    <path d="M33.5 21.5h-6v-6c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6h-6c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h6v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6h6c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    isOpen
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
                title="Liên hệ Zalo"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
}

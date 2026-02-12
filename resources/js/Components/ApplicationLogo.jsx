export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="zivraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path
                d="M20 20 L80 20 L20 80 L80 80"
                fill="none"
                stroke="url(#zivraGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#zivraGradient)" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
    );
}
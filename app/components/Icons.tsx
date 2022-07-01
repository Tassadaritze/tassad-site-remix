import { useTranslation } from "react-i18next";

export const MoonIcon = ({ className }: { className?: string | undefined }) => (
    <svg viewBox="0 0 760.59 758.56" height={48} className={className}>
        <path
            d="M499.85,500c23.56-24,85.85-93.66,103.94-204.36C623.94,172.4,576.22,78.29,560.66,50.29c15.73,9.16,168.63,101.8,187.38,289.2,17.14,171.25-91.29,286.09-106.77,301.94C620.86,661,520.4,753.16,369,749.61c-202.2-4.73-311-176-318.9-188.79,28.58,15.56,129.3,65.83,258.09,40.3C409.42,581.07,474.27,524.85,499.85,500Z"
            transform="translate(-5.28 -7.15)"
            fill="none"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
    </svg>
);

export const SunIcon = ({ className }: { className?: string | undefined }) => (
    <svg viewBox="0 0 682 682" height={48} className={className}>
        <circle cx="341" cy="341" r="100" fill="none" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="32" />
        <line
            x1="341"
            y1="16"
            x2="341"
            y2="166"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="341"
            y1="516"
            x2="341"
            y2="666"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="16"
            y1="341"
            x2="166"
            y2="341"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="516"
            y1="341"
            x2="666"
            y2="341"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="467.97"
            y1="214.03"
            x2="574.03"
            y2="107.97"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="107.97"
            y1="574.03"
            x2="214.03"
            y2="467.97"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="107.97"
            y1="107.97"
            x2="214.03"
            y2="214.03"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="467.97"
            y1="467.97"
            x2="574.03"
            y2="574.03"
            fill="none"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
    </svg>
);

export const MiniDownArrowIcon = ({ className, flip = false }: { className?: string | undefined; flip?: boolean }) => {
    const { t } = useTranslation("root");

    return (
        <svg
            viewBox="0 0 822.63 433.94"
            height={12}
            transform={`translate(0,6)${flip ? " rotate(180)" : ""}`}
            className={className}
        >
            <title>{t("miniArrow")}</title>
            <polyline
                points="11.31 11.31 411.31 411.31 811.31 11.31"
                fill="none"
                strokeMiterlimit="10"
                strokeWidth="32"
            />
        </svg>
    );
};

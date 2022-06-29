import { useTranslation } from "react-i18next";

export const MoonIcon = ({ className }: { className?: string | undefined }) => (
    <svg viewBox="0 0 703.22 692.44" height={48} className={className}>
        <path
            d="M86.22,580.92c101.24,125.89,262.06,180.19,401.4,136.8,198-61.66,294.79-302.54,231.3-471.6-31.79-84.66-97.7-135.15-137.7-160.2,5.4,103.5,61.2,250.2-90,405C337.21,648.6,187.92,587.22,86.22,580.92Z"
            transform="translate(-51.05 -56.03)"
            fill="none"
            stroke="white"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
    </svg>
);

export const SunIcon = ({ className }: { className?: string | undefined }) => (
    <svg viewBox="0 0 682 682" height={48} className={className}>
        <circle
            cx="341"
            cy="341"
            r="100"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
        <line
            x1="341"
            y1="16"
            x2="341"
            y2="166"
            fill="none"
            stroke="white"
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
            stroke="white"
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
            stroke="white"
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
            stroke="white"
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
            stroke="white"
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
            stroke="white"
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
            stroke="white"
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
            stroke="white"
            strokeLinecap="round"
            strokeMiterlimit="10"
            strokeWidth="32"
        />
    </svg>
);

export const MiniDownArrowIcon = ({ className, flip = false }: { className?: string | undefined; flip?: boolean }) => {
    const { t } = useTranslation("header");

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
                stroke="white"
                strokeMiterlimit="10"
                strokeWidth="32"
            />
        </svg>
    );
};

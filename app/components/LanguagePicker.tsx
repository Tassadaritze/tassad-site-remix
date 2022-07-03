import { useEffect, useState } from "react";
import { Form, useLocation, useTransition } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useLocale } from "remix-i18next";

import { MiniDownArrowIcon } from "~/components/Icons";

const LanguagePicker = () => {
    const locale = useLocale();
    const { i18n, t } = useTranslation("root");

    const supportedLanguages = i18n.options.supportedLngs ? [...i18n.options.supportedLngs] : [];
    if (supportedLanguages.length) {
        // remove currently selected locale and the weird locale used for tests
        for (const lang of [locale, "cimode"]) {
            const index = supportedLanguages.indexOf(lang);
            if (index > -1) {
                supportedLanguages.splice(index, 1);
            }
        }
    }

    const [isOpen, setIsOpen] = useState(false);

    const isSubmitting = useTransition().state === "submitting";
    useEffect(() => setIsOpen(false), [isSubmitting]);

    const { pathname } = useLocation();

    return (
        <div
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsOpen(false);
                }
            }}
            className="flex items-center"
        >
            <button
                onClick={() => {
                    setIsOpen((prevState) => !prevState);
                }}
                aria-label={t("switchLocale")}
                className="flex place-items-center gap-x-2"
            >
                {new Intl.DisplayNames(locale, { type: "language" }).of(locale)}
                <MiniDownArrowIcon height={12} flip={isOpen} className="stroke-mauve-dark-12" />
            </button>
            {isOpen && (
                <ul className="absolute absolute right-0 top-[4rem] z-10 min-w-[11.75rem] border-2 border-violet-6 bg-violet-3 text-violet-12 dark:border-violet-dark-6 dark:bg-violet-dark-3 dark:text-violet-dark-12">
                    <Form method="post">
                        <input type="hidden" name="redirectTo" value={pathname} />
                        {supportedLanguages.map((lang, i) => (
                            <li
                                key={i}
                                className="bg-violet-3 py-1 px-2 hover:bg-violet-4 dark:bg-violet-dark-3 dark:hover:bg-violet-dark-4"
                            >
                                <button name="lang" value={lang}>
                                    {new Intl.DisplayNames(lang, { type: "language" }).of(lang)}
                                </button>
                            </li>
                        ))}
                    </Form>
                </ul>
            )}
        </div>
    );
};

export default LanguagePicker;

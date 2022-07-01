import { useEffect, useState } from "react";
import { Form, useLocation, useTransition } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useLocale } from "remix-i18next";

import { MiniDownArrowIcon } from "~/components/Icons";

const LanguagePicker = () => {
    const locale = useLocale();
    const { i18n } = useTranslation();

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
        <div>
            <button
                onClick={() => {
                    setIsOpen((prevState) => !prevState);
                }}
                className="flex place-items-center gap-x-2"
            >
                {new Intl.DisplayNames(locale, { type: "language" }).of(locale)}
                <MiniDownArrowIcon flip={isOpen} className="stroke-mauve-dark-12" />
            </button>
            {isOpen && (
                <ul className="border-black bg-gray-800 absolute top-[4rem] right-0 z-10 min-w-[11.75rem] border-2 px-2">
                    <Form method="post">
                        <input type="hidden" name="redirectTo" value={pathname} />
                        {supportedLanguages.map((lang, i) => (
                            <li key={i} className="py-1">
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

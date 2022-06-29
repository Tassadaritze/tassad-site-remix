import { useEffect, useState } from "react";
import { Form, useTransition } from "@remix-run/react";
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

    return (
        <div>
            <button
                onClick={() => {
                    setIsOpen((prevState) => !prevState);
                }}
                className="flex place-items-center gap-x-2"
            >
                {new Intl.DisplayNames(locale, { type: "language" }).of(locale)}
                <MiniDownArrowIcon flip={isOpen} />
            </button>
            {isOpen && (
                <ul className="absolute top-[4rem] -mx-2 border-2 border-black bg-gray-800 p-2">
                    <Form method="post">
                        {supportedLanguages.map((lang, i) => (
                            <li key={i}>
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

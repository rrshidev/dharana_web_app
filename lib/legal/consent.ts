import type { Locale } from "@/lib/i18n/settings";
import { LEGAL } from "./config";
import type { LegalDocument } from "./types";

const ru: LegalDocument = {
  title: "Согласие на обработку персональных данных",
  updatedAt: LEGAL.effectiveDate.ru,
  version: LEGAL.version,
  intro:
    "Я, действуя свободно, своей волей и в своём интересе, даю согласие проекту Dharana (далее — Оператор) на обработку моих персональных данных на условиях, изложенных ниже.",
  sections: [
    {
      id: "data",
      title: "1. Перечень персональных данных",
      blocks: [
        {
          kind: "p",
          text: "Согласие распространяется на следующие данные:",
        },
        {
          kind: "list",
          items: [
            "Имя, адрес электронной почты, username, описание профиля, аватар, язык интерфейса и часовой пояс.",
            "Идентификаторы и открытые данные профиля при входе через Google, VK, Yandex и Telegram.",
            "Данные практики: выбранные асаны и комплексы, история и длительность сессий, даты практик, серии, избранное, настройки асаны дня и статистика.",
            "Данные подписки и платежей: статус и срок подписки, идентификаторы платежей и чеков.",
            "Технические данные: IP-адрес, устройство, браузер, операционная система, язык, часовой пояс, посещённые страницы, дата и время обращения, источник перехода.",
            "Аналитические данные Яндекс Метрики — только при отдельном согласии на аналитические cookies.",
            "Содержание обращений в поддержку и указанные в них контактные данные.",
          ],
        },
      ],
    },
    {
      id: "purposes",
      title: "2. Цели обработки",
      blocks: [
        {
          kind: "list",
          items: [
            "Регистрация, аутентификация и ведение аккаунта.",
            "Предоставление функций сайта, приложения и ботов, сохранение истории и статистики практики.",
            "Персонализация контента и настроек.",
            "Оформление, продление и обслуживание подписок и платежей.",
            "Ответы на обращения и поддержка.",
            "Обеспечение безопасности и предотвращение злоупотреблений.",
            "Улучшение продукта на основании согласия на аналитические cookies.",
            "Направление сервисных сообщений; от информационных рассылок можно отказаться.",
          ],
        },
      ],
    },
    {
      id: "actions",
      title: "3. Действия с персональными данными",
      blocks: [
        {
          kind: "p",
          text: "Оператор вправе совершать следующие действия: сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу в объёме и случаях, описанных в Политике конфиденциальности, обезличивание, блокирование, удаление и уничтожение персональных данных.",
        },
        {
          kind: "p",
          text: "Обработка осуществляется как автоматизированным, так и неавтоматизированным способом.",
        },
        {
          kind: "p",
          text: "Данные могут передаваться поставщикам, обеспечивающим работу сервиса (хостинг, платёжный провайдер, доставка email, Яндекс Метрика при согласии, Telegram при использовании ботов), в объёме, необходимом для оказания услуг.",
        },
      ],
    },
    {
      id: "term",
      title: "4. Срок действия согласия",
      blocks: [
        {
          kind: "p",
          text: "Согласие действует до удаления аккаунта или до его отзыва, если иное не требуется законодательством. Для данных, которые Оператор обязан хранить по закону (например, сведения о платежах), обработка продолжается в течение установленного законом срока.",
        },
      ],
    },
    {
      id: "withdrawal",
      title: "5. Отзыв согласия",
      blocks: [
        {
          kind: "p",
          text: "Согласие можно отозвать в любой момент, направив письмо на support@dharana.ru с адреса, указанного в аккаунте. По этому же адресу можно запросить удаление аккаунта и связанных данных.",
        },
        {
          kind: "p",
          text: "После отзыва согласия Оператор прекращает обработку и удаляет данные в срок, не превышающий 30 дней, если отсутствуют законные основания для их дальнейшего хранения. Отзыв не влияет на обработку, осуществлённую до момента отзыва.",
        },
        {
          kind: "p",
          text: "Отказ от аналитических cookies не требует отзыва настоящего согласия: для этого достаточно кнопки «Только необходимые» в cookie-баннере или раздела «Настройки cookies» в футере сайта.",
        },
      ],
    },
    {
      id: "rights",
      title: "6. Права и подтверждение",
      blocks: [
        {
          kind: "p",
          text: "Я подтверждаю, что ознакомлен(а) с Политикой конфиденциальности, мне понятны цели и условия обработки, а также мои права: получать информацию об обработке, требовать уточнения, блокирования или удаления данных, отозвать согласие и обратиться с жалобой в Роскомнадзор или суд.",
        },
        {
          kind: "p",
          text: "Я подтверждаю, что достиг(ла) 18 лет либо получил(а) согласие законного представителя на использование сервиса.",
        },
      ],
    },
    {
      id: "contacts",
      title: "7. Контакты Оператора",
      blocks: [
        {
          kind: "list",
          items: [
            `Email: ${LEGAL.contactEmail}`,
            `Сайт: ${LEGAL.siteUrl}`,
            `Версия согласия: ${LEGAL.version}.`,
          ],
        },
      ],
    },
  ],
};

const en: LegalDocument = {
  title: "Consent to Personal Data Processing",
  updatedAt: LEGAL.effectiveDate.en,
  version: LEGAL.version,
  intro:
    "I, acting freely, of my own will and in my own interest, give my consent to the Dharana project (the “Operator”) to process my personal data on the terms set out below.",
  sections: [
    {
      id: "data",
      title: "1. Personal data covered",
      blocks: [
        {
          kind: "p",
          text: "This consent covers the following data:",
        },
        {
          kind: "list",
          items: [
            "Name, email address, username, profile bio, avatar, interface language and time zone.",
            "Identifiers and public profile data when signing in via Google, VK, Yandex and Telegram.",
            "Practice data: selected asanas and sequences, session history and duration, practice dates, streaks, favourites, asana-of-the-day settings and statistics.",
            "Subscription and payment data: subscription status and term, payment and receipt identifiers.",
            "Technical data: IP address, device, browser, operating system, language, time zone, pages visited, date and time of access, referral source.",
            "Yandex Metrica analytics data — only with separate consent to analytics cookies.",
            "The content of support requests and the contact details provided in them.",
          ],
        },
      ],
    },
    {
      id: "purposes",
      title: "2. Purposes of processing",
      blocks: [
        {
          kind: "list",
          items: [
            "Registration, authentication and account management.",
            "Providing website, app and bot features, and storing practice history and statistics.",
            "Personalising content and settings.",
            "Purchasing, renewing and servicing subscriptions and payments.",
            "Responding to requests and providing support.",
            "Security and abuse prevention.",
            "Product improvement based on consent to analytics cookies.",
            "Service messages; you can opt out of informational newsletters.",
          ],
        },
      ],
    },
    {
      id: "actions",
      title: "3. Actions with personal data",
      blocks: [
        {
          kind: "p",
          text: "The Operator may perform the following actions: collection, recording, systematisation, accumulation, storage, clarification (updating, changing), extraction, use, transfer to the extent and in the cases described in the Privacy Policy, anonymisation, blocking, deletion and destruction of personal data.",
        },
        {
          kind: "p",
          text: "Processing is carried out both by automated and non-automated means.",
        },
        {
          kind: "p",
          text: "Data may be shared with providers that support the service (hosting, payment provider, email delivery, Yandex Metrica with consent, Telegram when using the bots) to the extent necessary to provide the services.",
        },
      ],
    },
    {
      id: "term",
      title: "4. Duration of consent",
      blocks: [
        {
          kind: "p",
          text: "This consent is valid until the account is deleted or the consent is withdrawn, unless otherwise required by law. For data that the Operator is obliged to retain by law (for example, payment records), processing continues for the period established by law.",
        },
      ],
    },
    {
      id: "withdrawal",
      title: "5. Withdrawal of consent",
      blocks: [
        {
          kind: "p",
          text: "You may withdraw your consent at any time by emailing support@dharana.ru from the address linked to your account. You can also request deletion of your account and related data at the same address.",
        },
        {
          kind: "p",
          text: "After withdrawal, the Operator stops processing and deletes the data within 30 days, unless there are lawful grounds for further retention. Withdrawal does not affect processing carried out before the withdrawal.",
        },
        {
          kind: "p",
          text: "Declining analytics cookies does not require withdrawing this consent: use the “Necessary only” button in the cookie banner or “Cookie settings” in the website footer.",
        },
      ],
    },
    {
      id: "rights",
      title: "6. Rights and confirmation",
      blocks: [
        {
          kind: "p",
          text: "I confirm that I have read the Privacy Policy, that I understand the purposes and terms of processing and my rights: to obtain information about processing, request clarification, blocking or deletion of data, withdraw consent and lodge a complaint with Roskomnadzor or a court.",
        },
        {
          kind: "p",
          text: "I confirm that I am 18 years of age or older, or that I have the consent of my legal representative to use the service.",
        },
      ],
    },
    {
      id: "contacts",
      title: "7. Operator contacts",
      blocks: [
        {
          kind: "list",
          items: [
            `Email: ${LEGAL.contactEmail}`,
            `Website: ${LEGAL.siteUrl}`,
            `Consent version: ${LEGAL.version}.`,
          ],
        },
      ],
    },
  ],
};

export const personalDataConsent: Record<Locale, LegalDocument> = { ru, en };

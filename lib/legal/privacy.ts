import type { Locale } from "@/lib/i18n/settings";
import { LEGAL } from "./config";
import type { LegalDocument } from "./types";

const ru: LegalDocument = {
  title: "Политика конфиденциальности",
  updatedAt: LEGAL.effectiveDate.ru,
  version: LEGAL.version,
  intro:
    "Настоящая Политика конфиденциальности (далее — Политика) описывает, какие персональные данные собирает проект Dharana (далее — Проект, мы), как мы их используем, храним и защищаем, а также какие права есть у пользователя. Политика применяется к сайту dharana.ru, мобильному приложению Dharana, Telegram-ботам проекта и связанным с ними сервисам.",
  sections: [
    {
      id: "general",
      title: "1. Общие положения",
      blocks: [
        {
          kind: "p",
          text: "Оператором персональных данных выступает проект Dharana. Контакт по вопросам обработки персональных данных: support@dharana.ru.",
        },
        {
          kind: "p",
          text: "Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и иными применимыми нормами законодательства Российской Федерации.",
        },
        {
          kind: "p",
          text: "Используя сайт, приложение или ботов, вы подтверждаете, что ознакомились с Политикой. Обработка данных, для которой требуется согласие, осуществляется только после его получения. Если вы не согласны с Политикой, пожалуйста, прекратите использование сервиса.",
        },
        {
          kind: "p",
          text: "Мы можем обновлять Политику. Актуальная редакция всегда доступна на этой странице; дата вступления в силу указана в начале документа.",
        },
      ],
    },
    {
      id: "terms",
      title: "2. Термины",
      blocks: [
        {
          kind: "list",
          items: [
            "Персональные данные — любая информация, относящаяся прямо или косвенно к пользователю.",
            "Обработка персональных данных — сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передача, обезличивание, блокирование, удаление и уничтожение данных.",
            "Пользователь — лицо, использующее сайт, мобильное приложение или ботов проекта.",
            "Cookies — небольшие текстовые файлы, которые сайт сохраняет в браузере пользователя.",
          ],
        },
      ],
    },
    {
      id: "data",
      title: "3. Какие данные мы собираем",
      blocks: [
        {
          kind: "p",
          text: "Мы собираем только те данные, которые нужны для работы сервиса, и не стремимся собирать больше, чем необходимо.",
        },
        {
          kind: "list",
          items: [
            "Данные аккаунта: имя, адрес электронной почты, хеш пароля, username, описание профиля, аватар, язык интерфейса и часовой пояс.",
            "Данные входа через сторонние сервисы: идентификаторы и открытые данные профиля Google, VK, Yandex и Telegram (имя, username, email, аватар) в объёме, который передаёт соответствующий провайдер.",
            "Данные практики: выбранные асаны и комплексы, история и длительность сессий, даты практик, серии, избранное, настройки асаны дня и статистика.",
            "Данные подписки и платежей: статус подписки, срок её действия, идентификаторы платежей и чеков. Данные банковской карты обрабатываются платёжным провайдером, мы их не храним.",
            "Технические данные: IP-адрес, тип устройства и браузера, операционная система, язык, часовой пояс, посещённые страницы и элементы интерфейса, дата и время обращения, источник перехода.",
            "Аналитические данные: события и поведение на сайте, включая данные Яндекс Метрики, — только при наличии согласия на аналитические cookies.",
            "Обращения в поддержку: содержание сообщений и контактные данные, которые вы указываете.",
          ],
        },
        {
          kind: "p",
          text: "Мы не собираем специальные категории персональных данных (о здоровье, религии, политических взглядах и т. п.) и не просим сообщать их. Если вы добровольно упоминаете такие сведения в переписке, мы обрабатываем их только для ответа на обращение.",
        },
      ],
    },
    {
      id: "purposes",
      title: "4. Цели обработки",
      blocks: [
        {
          kind: "list",
          items: [
            "Регистрация, аутентификация и ведение аккаунта.",
            "Предоставление функций сайта, приложения и ботов, сохранение истории и статистики практики.",
            "Персонализация контента, интерфейса и настроек.",
            "Оформление, продление и обслуживание подписок и платежей.",
            "Ответы на обращения и поддержка пользователей.",
            "Обеспечение безопасности, предотвращение злоупотреблений и техническая диагностика.",
            "Улучшение продукта и анализ использования — на основании согласия на аналитические cookies.",
            "Направление сервисных и информационных сообщений; от информационных рассылок можно отказаться.",
          ],
        },
      ],
    },
    {
      id: "legal-bases",
      title: "5. Правовые основания",
      blocks: [
        {
          kind: "list",
          items: [
            "Исполнение договора с пользователем — предоставление доступа к сервису и его функциям.",
            "Согласие пользователя — аналитические cookies, отдельные рассылки и иная обработка, для которой закон требует согласия.",
            "Законные интересы — безопасность, предотвращение мошенничества и улучшение сервиса, при условии ненарушения прав пользователя.",
            "Исполнение требований законодательства.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies и аналитика",
      blocks: [
        {
          kind: "p",
          text: "Необходимые cookies обеспечивают вход, безопасность, сохранение настроек (тема, язык, выбор согласия) и работу сайта. Они используются без отдельного согласия, поскольку необходимы для работы сервиса.",
        },
        {
          kind: "p",
          text: "Аналитические cookies и Яндекс Метрика помогают понять, как используется сайт, и делать его удобнее. Они подключаются только после того, как вы нажмёте «Принять все» в баннере cookies.",
        },
        {
          kind: "p",
          text: "Вы можете отказаться от аналитики кнопкой «Только необходимые», изменить решение в футере сайта («Настройки cookies») или удалить данные сайта в браузере. Отключение аналитических cookies не ограничивает доступ к основным функциям.",
        },
        {
          kind: "p",
          text: "Мы не используем cookies для рекламного таргетинга и не передаём данные Яндекс Метрики для рекламы.",
        },
      ],
    },
    {
      id: "sharing",
      title: "7. Передача данных",
      blocks: [
        {
          kind: "p",
          text: "Мы не продаём персональные данные и не передаём их третьим лицам для собственных маркетинговых целей.",
        },
        {
          kind: "p",
          text: "Данные могут передаваться поставщикам, обеспечивающим работу сервиса: хостинг и инфраструктура, платёжный провайдер, сервис отправки email, Яндекс Метрика (аналитика при наличии согласия), Telegram (при использовании ботов). Передача осуществляется в объёме, необходимом для оказания услуг, и на условиях конфиденциальности.",
        },
        {
          kind: "p",
          text: "Данные могут быть предоставлены государственным органам по законному требованию, а также использоваться для защиты прав и законных интересов проекта в случае спора.",
        },
        {
          kind: "p",
          text: "При передаче данных за пределы Российской Федерации мы принимаем меры, предусмотренные законодательством о персональных данных.",
        },
      ],
    },
    {
      id: "retention",
      title: "8. Хранение и сроки",
      blocks: [
        {
          kind: "list",
          items: [
            "Данные аккаунта и практики хранятся, пока аккаунт активен, и удаляются или обезличиваются после удаления аккаунта, если иное не требуется законом.",
            "Технические журналы — не более 12 месяцев, если более длительный срок не требуется для безопасности.",
            "Записи о согласии — в течение срока действия согласия и 3 лет после его отзыва для подтверждения соблюдения закона.",
            "Данные о платежах — в сроки, установленные законодательством о бухгалтерском учёте.",
            "Данные, необходимые для исполнения законных требований, могут храниться дольше.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "9. Права пользователя",
      blocks: [
        {
          kind: "list",
          items: [
            "Получить информацию об обработке своих персональных данных.",
            "Требовать уточнения, блокирования или удаления данных, если они неполные, устаревшие, неточные или незаконно полученные.",
            "Отозвать согласие на обработку персональных данных.",
            "Возразить против обработки, основанной на законном интересе.",
            "Запросить копию своих данных в машиночитаемом виде.",
            "Обратиться с жалобой в Роскомнадзор или в суд.",
          ],
        },
        {
          kind: "p",
          text: "Для реализации прав напишите на support@dharana.ru. Мы ответим в сроки, установленные законом (как правило, до 10 рабочих дней), и можем запросить подтверждение личности, чтобы не раскрыть данные постороннему.",
        },
        {
          kind: "p",
          text: "Удаление аккаунта и связанных данных — по запросу на support@dharana.ru. После удаления данные могут сохраняться в резервных копиях ограниченное время, а также в объёме, который требуется законом.",
        },
      ],
    },
    {
      id: "security",
      title: "10. Безопасность",
      blocks: [
        {
          kind: "p",
          text: "Мы используем шифрование канала (HTTPS), хеширование паролей, ограничение доступа, журналирование и организационные меры защиты. Доступ к персональным данным предоставляется только тем, кому он необходим для работы сервиса.",
        },
        {
          kind: "p",
          text: "Ни один способ передачи и хранения данных не гарантирует абсолютную безопасность. При инциденте мы принимаем необходимые меры и уведомляем пользователей в случаях, предусмотренных законом.",
        },
      ],
    },
    {
      id: "children",
      title: "11. Дети",
      blocks: [
        {
          kind: "p",
          text: "Сервис не предназначен для детей младше 18 лет без согласия законного представителя. Если вы законный представитель и считаете, что данные ребёнка обрабатываются без согласия, свяжитесь с нами — мы удалим такие данные.",
        },
      ],
    },
    {
      id: "changes",
      title: "12. Изменения Политики",
      blocks: [
        {
          kind: "p",
          text: "Мы можем обновлять Политику. Существенные изменения публикуются на этой странице с новой датой вступления в силу. Продолжение использования сервиса после вступления изменений в силу означает ознакомление с новой редакцией, если иное не требуется законом.",
        },
        {
          kind: "p",
          text: `Версия Политики: ${LEGAL.version}.`,
        },
      ],
    },
    {
      id: "contacts",
      title: "13. Контакты",
      blocks: [
        {
          kind: "list",
          items: [
            `Email: ${LEGAL.contactEmail}`,
            `Сайт: ${LEGAL.siteUrl}`,
            "По вопросам персональных данных мы отвечаем в течение 10 рабочих дней.",
          ],
        },
      ],
    },
  ],
};

const en: LegalDocument = {
  title: "Privacy Policy",
  updatedAt: LEGAL.effectiveDate.en,
  version: LEGAL.version,
  intro:
    "This Privacy Policy describes what personal data the Dharana project (the “Project”, “we”) collects, how we use, store and protect it, and what rights users have. The Policy applies to the dharana.ru website, the Dharana mobile app, the project’s Telegram bots and related services.",
  sections: [
    {
      id: "general",
      title: "1. General provisions",
      blocks: [
        {
          kind: "p",
          text: "The data controller is the Dharana project. Contact for personal data matters: support@dharana.ru.",
        },
        {
          kind: "p",
          text: "This Policy is drafted in accordance with Federal Law No. 152-FZ of 27 July 2006 “On Personal Data” and other applicable legislation of the Russian Federation.",
        },
        {
          kind: "p",
          text: "By using the website, app or bots, you confirm that you have read this Policy. Processing that requires consent is carried out only after such consent is obtained. If you disagree with this Policy, please stop using the service.",
        },
        {
          kind: "p",
          text: "We may update this Policy. The current version is always available on this page; the effective date is shown at the top of the document.",
        },
      ],
    },
    {
      id: "terms",
      title: "2. Definitions",
      blocks: [
        {
          kind: "list",
          items: [
            "Personal data — any information relating directly or indirectly to a user.",
            "Processing — collection, recording, systematisation, accumulation, storage, clarification (updating, changing), extraction, use, transfer, anonymisation, blocking, deletion and destruction of data.",
            "User — a person using the project’s website, mobile app or bots.",
            "Cookies — small text files stored by the website in the user’s browser.",
          ],
        },
      ],
    },
    {
      id: "data",
      title: "3. Data we collect",
      blocks: [
        {
          kind: "p",
          text: "We collect only the data needed to operate the service and do not seek to collect more than necessary.",
        },
        {
          kind: "list",
          items: [
            "Account data: name, email address, password hash, username, profile bio, avatar, interface language and time zone.",
            "Third-party sign-in data: identifiers and public profile data from Google, VK, Yandex and Telegram (name, username, email, avatar) to the extent provided by the relevant provider.",
            "Practice data: selected asanas and sequences, session history and duration, practice dates, streaks, favourites, asana-of-the-day settings and statistics.",
            "Subscription and payment data: subscription status, term, payment and receipt identifiers. Bank card details are processed by the payment provider; we do not store them.",
            "Technical data: IP address, device and browser type, operating system, language, time zone, pages and interface elements visited, date and time of access, referral source.",
            "Analytics data: website events and behaviour, including Yandex Metrica data — only if you consent to analytics cookies.",
            "Support messages: the content of messages and contact details you provide.",
          ],
        },
        {
          kind: "p",
          text: "We do not collect special categories of personal data (health, religion, political views, etc.) and do not ask you to provide them. If you voluntarily mention such information in correspondence, we process it only to respond to your request.",
        },
      ],
    },
    {
      id: "purposes",
      title: "4. Purposes of processing",
      blocks: [
        {
          kind: "list",
          items: [
            "Registration, authentication and account management.",
            "Providing website, app and bot features, and storing practice history and statistics.",
            "Personalising content, interface and settings.",
            "Purchasing, renewing and servicing subscriptions and payments.",
            "Responding to requests and providing support.",
            "Security, abuse prevention and technical diagnostics.",
            "Product improvement and usage analysis — based on consent to analytics cookies.",
            "Service and informational messages; you can opt out of informational newsletters.",
          ],
        },
      ],
    },
    {
      id: "legal-bases",
      title: "5. Legal bases",
      blocks: [
        {
          kind: "list",
          items: [
            "Performance of the contract with the user — providing access to the service and its features.",
            "User consent — analytics cookies, certain newsletters and other processing for which the law requires consent.",
            "Legitimate interests — security, fraud prevention and service improvement, provided that users’ rights are not violated.",
            "Compliance with legal requirements.",
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "6. Cookies and analytics",
      blocks: [
        {
          kind: "p",
          text: "Necessary cookies enable sign-in, security, saving settings (theme, language, consent choice) and the operation of the website. They are used without separate consent because they are essential to the service.",
        },
        {
          kind: "p",
          text: "Analytics cookies and Yandex Metrica help us understand how the website is used and make it more convenient. They are enabled only after you click “Accept all” in the cookie banner.",
        },
        {
          kind: "p",
          text: "You can decline analytics with the “Necessary only” button, change your decision via “Cookie settings” in the website footer, or delete site data in your browser. Disabling analytics cookies does not restrict access to the main features.",
        },
        {
          kind: "p",
          text: "We do not use cookies for advertising targeting and do not share Yandex Metrica data for advertising.",
        },
      ],
    },
    {
      id: "sharing",
      title: "7. Data sharing",
      blocks: [
        {
          kind: "p",
          text: "We do not sell personal data or share it with third parties for their own marketing purposes.",
        },
        {
          kind: "p",
          text: "Data may be shared with providers that support the service: hosting and infrastructure, the payment provider, the email delivery service, Yandex Metrica (analytics with consent) and Telegram (when using the bots). Sharing is limited to what is necessary to provide the services and is subject to confidentiality obligations.",
        },
        {
          kind: "p",
          text: "Data may be disclosed to public authorities upon a lawful request and used to protect the rights and legitimate interests of the project in the event of a dispute.",
        },
        {
          kind: "p",
          text: "When transferring data outside the Russian Federation, we take the measures required by personal data legislation.",
        },
      ],
    },
    {
      id: "retention",
      title: "8. Storage and retention",
      blocks: [
        {
          kind: "list",
          items: [
            "Account and practice data is stored while the account is active and is deleted or anonymised after account deletion, unless otherwise required by law.",
            "Technical logs — no longer than 12 months, unless a longer period is required for security.",
            "Consent records — for the duration of consent and for 3 years after withdrawal to confirm legal compliance.",
            "Payment data — for the periods established by accounting legislation.",
            "Data required to comply with legal requirements may be retained longer.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "9. Your rights",
      blocks: [
        {
          kind: "list",
          items: [
            "Obtain information about the processing of your personal data.",
            "Request clarification, blocking or deletion of data that is incomplete, outdated, inaccurate or unlawfully obtained.",
            "Withdraw consent to personal data processing.",
            "Object to processing based on legitimate interests.",
            "Request a copy of your data in a machine-readable format.",
            "Lodge a complaint with Roskomnadzor or a court.",
          ],
        },
        {
          kind: "p",
          text: "To exercise your rights, email support@dharana.ru. We respond within the periods established by law (usually within 10 business days) and may ask you to confirm your identity so that data is not disclosed to third parties.",
        },
        {
          kind: "p",
          text: "You can request deletion of your account and related data at support@dharana.ru. After deletion, data may remain in backups for a limited time and to the extent required by law.",
        },
      ],
    },
    {
      id: "security",
      title: "10. Security",
      blocks: [
        {
          kind: "p",
          text: "We use HTTPS encryption, password hashing, access restrictions, logging and organisational safeguards. Access to personal data is granted only to those who need it to operate the service.",
        },
        {
          kind: "p",
          text: "No method of transmission or storage guarantees absolute security. In the event of an incident, we take the necessary measures and notify users where required by law.",
        },
      ],
    },
    {
      id: "children",
      title: "11. Children",
      blocks: [
        {
          kind: "p",
          text: "The service is not intended for children under 18 without the consent of a legal representative. If you are a legal representative and believe a child’s data is processed without consent, contact us and we will delete it.",
        },
      ],
    },
    {
      id: "changes",
      title: "12. Changes to this Policy",
      blocks: [
        {
          kind: "p",
          text: "We may update this Policy. Material changes are published on this page with a new effective date. Continued use of the service after the changes take effect means that you have read the new version, unless otherwise required by law.",
        },
        {
          kind: "p",
          text: `Policy version: ${LEGAL.version}.`,
        },
      ],
    },
    {
      id: "contacts",
      title: "13. Contacts",
      blocks: [
        {
          kind: "list",
          items: [
            `Email: ${LEGAL.contactEmail}`,
            `Website: ${LEGAL.siteUrl}`,
            "We respond to personal data requests within 10 business days.",
          ],
        },
      ],
    },
  ],
};

export const privacyPolicy: Record<Locale, LegalDocument> = { ru, en };

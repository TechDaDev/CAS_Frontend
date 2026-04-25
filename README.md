# CAS Frontend

واجهة Correspondence Archiving System المبنية بـ Next.js لتشغيل مسارات المعاملات، الإحالات، الموافقات، السجل، الطباعة والإرسال، والإشعارات مع دعم صلاحيات مؤسسية دقيقة وواجهة عربية RTL.

## الغرض من المشروع

- توفير واجهة تشغيل يومية لمعاملات المؤسسات الأكاديمية.
- استهلاك واجهات OMS/CAS الخلفية مع JWT وتجديد الجلسة تلقائياً.
- احترام صلاحيات backend الجديدة مثل `UserAccessContext` و`TransactionAccess` وSQL-scoped attachment visibility.
- دعم التحميل المرحلي للبيانات الكبيرة عبر pagination envelopes في كل القوائم الحرجة.

## التقنية المستخدمة

- Next.js 16 App Router
- React 19
- TypeScript
- TanStack Query
- Zod
- React Hook Form
- Tailwind CSS 4
- Vitest + Testing Library
- Playwright

## المتغيرات البيئية

أنشئ ملف `.env.local` عند التطوير:

```bash
NEXT_PUBLIC_API_URL=https://corrarchivsystem.up.railway.app
NEXT_PUBLIC_APP_NAME=Correspondence Archiving System
NEXT_PUBLIC_DEFAULT_LOCALE=ar
```

ملاحظات:

- إذا لم يتم تعريف `NEXT_PUBLIC_API_URL` فسيستخدم التطبيق `https://corrarchivsystem.up.railway.app/api` في التطوير والإنتاج.
- يضيف `lib/env.ts` لاحقة `/api` تلقائياً عند الحاجة.

## عنوان الـ backend

- الافتراضي: `https://corrarchivsystem.up.railway.app/api`
- جميع خدمات الواجهة تعتمد هذا العنوان كنقطة أساس.
- تفاصيل العقود موجودة في [API_DOCUMENTATION.md](/home/zeus3000/PycharmProjects/oms_frontend/API_DOCUMENTATION.md).

## التشغيل المحلي

```bash
npm install
npm run dev
```

افتح `http://127.0.0.1:3000`.

## أوامر الجودة

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run test:e2e
npm run build
```

## تدفق المصادقة

- تسجيل الدخول يطلب `POST /auth/login/` ويحفظ `access` و`refresh` محلياً.
- كل طلب API يرفق `Authorization: Bearer <access-token>` تلقائياً.
- عند `401` يحاول العميل تنفيذ refresh مرة واحدة فقط مع single-flight لمنع تعدد طلبات refresh المتوازية.
- عند فشل refresh تُمسح الرموز ويُستدعى callback logout مركزي دون redirect من داخل عميل API نفسه.
- صفحة `/login` تحافظ على `redirect` وتعيد المستخدم إلى المسار المطلوب بعد نجاح المصادقة.

## سلوك الصلاحيات في الواجهة

- يتم الاعتماد أولاً على `access_summary` و`permissions` القادمة من backend.
- عند غياب الصلاحيات الصريحة، تستخدم الواجهة افتراضاً محافظاً ولا تعرض الأزرار الحساسة لمجرد أن المستخدم authenticated.
- الشريط الجانبي وأزرار تفاصيل المعاملة ورفع المرفقات تعتمد `usePermissions()`.
- الوصول إلى تبويب التدقيق يعرض حالة رفض مناسبة إذا أعاد backend `403`.

## سلوك المرفقات

- الرفع يتم عبر `multipart/form-data` إلى `/transactions/attachments/`.
- تنزيل الملفات المحمية يتم من `/transactions/attachments/{id}/download/` عبر `api.downloadBlob()` مع المصادقة.
- الواجهة لا تعتمد على `attachment.file` كرابط تحميل مباشر.
- إذا أعاد backend بيانات استخراج OCR أو metadata فتعرض الواجهة حالة الاستخراج وتاريخه ورسائل الفشل عند توفرها.

## سلوك التصفح والصفحات

- القوائم الحساسة تعتمد envelopes من نوع DRF (`count`, `next`, `previous`, `results`).
- صفحة المعاملات تعتمد URL state للفلاتر والبحث والصفحات.
- تبويبات تفاصيل المعاملة تحمل بياناتها lazily وبشكل منفصل لكل تبويب.
- لوحة التحكم تستخدم TanStack Query وتتعامل مع فشل كل widget بشكل مستقل.

## ملاحظات النشر

- يفضّل تعريف `NEXT_PUBLIC_API_URL` صراحةً في بيئة الإنتاج، لكن التطبيق يملك fallback افتراضياً إلى `https://corrarchivsystem.up.railway.app/api`.
- إذا كان backend يستخدم media محمية، أبقِ تنزيل المرفقات عبر endpoint المحمي فقط.
- شغّل قبل النشر:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## ملاحظات تطويرية

- تم تحديث العميل ليتعامل مع `429` و`Retry-After` عبر `ApiError.retryAfter`.
- تم توسيع الأنواع لتشمل snapshot fields مثل `attachment_count` و`print_dispatch_status` و`last_activity_at`.
- تم تجهيز CI في GitHub Actions لتشغيل lint, typecheck, tests, build على كل push وpull request.

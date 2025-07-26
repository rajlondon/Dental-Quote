-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "clinic_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"clinic_id" integer NOT NULL,
	"user_id" integer,
	"booking_id" integer,
	"rating" integer NOT NULL,
	"review_text" text,
	"treatment" varchar(100),
	"verified" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending',
	"admin_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(255),
	"address" text,
	"city" varchar(100) DEFAULT 'Istanbul',
	"country" varchar(100) DEFAULT 'Turkey',
	"description" text,
	"email" varchar(255),
	"phone" varchar(50),
	"website" varchar(255),
	"tier" varchar(20) DEFAULT 'standard',
	"rating" numeric(3, 1),
	"review_count" integer DEFAULT 0,
	"guarantee" varchar(50),
	"features" json,
	"materials" json,
	"languages" json,
	"specialties" json,
	"treatments" json,
	"logo_url" varchar(255),
	"main_image_url" varchar(255),
	"gallery_images" json,
	"before_after_images" json DEFAULT '[]'::json,
	"clinic_tour_videos" json DEFAULT '[]'::json,
	"testimonial_videos" json DEFAULT '[]'::json,
	"admin_notes" text,
	"active" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" integer,
	"quote_request_id" integer,
	"treatment_plan_id" integer,
	"uploaded_by_id" integer,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255),
	"mimetype" varchar(100),
	"file_type" varchar(50),
	"file_size" bigint,
	"file_url" varchar(255),
	"file_category" varchar(50) DEFAULT 'xray',
	"visibility" varchar(20) DEFAULT 'private',
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_request_id" integer NOT NULL,
	"version_number" integer NOT NULL,
	"created_by_id" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"quote_data" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"has_attachment" boolean DEFAULT false,
	"attachment_id" integer,
	"message_type" varchar(20) DEFAULT 'text',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"content" text,
	"is_read" boolean DEFAULT false,
	"type" varchar(20) DEFAULT 'info',
	"action" varchar(255),
	"entity_type" varchar(50),
	"entity_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"payment_type" varchar(50) DEFAULT 'deposit' NOT NULL,
	"transaction_id" varchar(255),
	"stripe_payment_intent_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"receipt_url" varchar(255),
	"notes" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" integer,
	"treatment_plan_id" integer,
	"hotel_id" integer,
	"check_in_date" date NOT NULL,
	"check_out_date" date NOT NULL,
	"room_type" varchar(100),
	"number_of_guests" integer DEFAULT 1,
	"accommodation_package" varchar(50) DEFAULT 'standard',
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"confirmation_number" varchar(50),
	"provided_by" varchar(50) DEFAULT 'clinic',
	"provider_details" json,
	"total_cost" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'GBP',
	"includes_breakfast" boolean DEFAULT true,
	"additional_services" json,
	"special_requests" text,
	"admin_notes" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"treatment" text NOT NULL,
	"specific_treatment" text,
	"other_treatment" text,
	"departure_city" varchar(100),
	"travel_month" varchar(50),
	"hotel_accommodation" varchar(20) DEFAULT 'clinic_decide',
	"needs_accommodation" boolean DEFAULT false,
	"accommodation_type" varchar(50),
	"has_xrays" boolean DEFAULT false,
	"xray_count" integer,
	"budget" varchar(50),
	"dates" varchar(100),
	"notes" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"quote_data" json,
	"special_offer" json,
	"selected_clinic_id" integer,
	"admin_notes" text,
	"clinic_notes" text,
	"viewed_by_admin" boolean DEFAULT false,
	"viewed_by_clinic" boolean DEFAULT false,
	"consent" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(100) DEFAULT 'Istanbul',
	"country" varchar(100) DEFAULT 'Turkey',
	"star_rating" numeric(2, 1),
	"description" text,
	"amenities" json,
	"main_image_url" varchar(255),
	"gallery_images" json,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"distance_to_clinic" json,
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"website" varchar(255),
	"is_active" boolean DEFAULT true,
	"is_partner" boolean DEFAULT false,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_reference" varchar(20),
	"user_id" integer NOT NULL,
	"quote_request_id" integer,
	"clinic_id" integer,
	"treatment_plan_id" integer,
	"assigned_admin_id" integer,
	"assigned_clinic_staff_id" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"stage" varchar(50) DEFAULT 'deposit',
	"deposit_paid" boolean DEFAULT false,
	"deposit_amount" numeric(10, 2) DEFAULT '200.00',
	"total_paid" numeric(10, 2) DEFAULT '0.00',
	"balance_due" numeric(10, 2),
	"arrival_date" date,
	"departure_date" date,
	"flight_number" varchar(50),
	"accommodation_type" varchar(50),
	"accommodation_details" text,
	"treatment_notes" text,
	"patient_notes" text,
	"admin_notes" text,
	"clinic_notes" text,
	"last_patient_message_at" timestamp,
	"last_clinic_message_at" timestamp,
	"last_admin_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference"),
	CONSTRAINT "bookings_quote_request_id_unique" UNIQUE("quote_request_id")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"clinic_id" integer,
	"title" varchar(100) NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"type" varchar(50) DEFAULT 'consultation',
	"status" varchar(50) DEFAULT 'scheduled',
	"clinic_notes" text,
	"admin_notes" text,
	"reminder_sent" boolean DEFAULT false,
	"follow_up_required" boolean DEFAULT false,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"clinic_id" integer,
	"created_by_id" integer,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"treatment_details" json NOT NULL,
	"estimated_total_cost" numeric(10, 2),
	"currency" varchar(3) DEFAULT 'GBP',
	"includes_hotel" boolean DEFAULT false,
	"hotel_details" json,
	"notes" text,
	"portal_status" varchar(50) DEFAULT 'active',
	"quote_request_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"type" varchar(20) NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"profile_image" varchar(255),
	"address" varchar(255),
	"date_of_birth" varchar(20),
	"nationality" varchar(100),
	"preferred_language" varchar(50) DEFAULT 'English',
	"passport_number" varchar(50),
	"emergency_contact" json,
	"medical_info" json,
	"role" varchar(20) DEFAULT 'patient' NOT NULL,
	"clinic_id" integer,
	"job_title" varchar(100),
	"last_login" timestamp,
	"email_verified" boolean DEFAULT false,
	"profile_complete" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"google_id" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE "treatment_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"package_price" numeric NOT NULL,
	"original_price" numeric NOT NULL,
	"clinic_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_inclusions" (
	"package_id" text,
	"inclusion_type" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_treatments" (
	"package_id" text,
	"treatment_type" text NOT NULL,
	"treatment_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clinic_reviews" ADD CONSTRAINT "clinic_reviews_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_reviews" ADD CONSTRAINT "clinic_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_reviews" ADD CONSTRAINT "clinic_reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD CONSTRAINT "quote_versions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_attachment_id_files_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_bookings" ADD CONSTRAINT "hotel_bookings_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_admin_id_users_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_clinic_staff_id_users_id_fk" FOREIGN KEY ("assigned_clinic_staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_patient_id_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_inclusions" ADD CONSTRAINT "package_inclusions_package_id_treatment_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."treatment_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_treatments" ADD CONSTRAINT "package_treatments_package_id_treatment_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."treatment_packages"("id") ON DELETE no action ON UPDATE no action;
*/
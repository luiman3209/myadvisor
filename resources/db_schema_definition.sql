
CREATE SEQUENCE myadvisor.appointment_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE SEQUENCE myadvisor.user_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE myadvisor.review_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE myadvisor.message_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE myadvisor.payment_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

-- user_configs table
CREATE TABLE myadvisor.user_configs (
    user_id INT PRIMARY KEY DEFAULT nextval('myadvisor.user_id_seq'),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('investor', 'advisor', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE myadvisor.profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    address TEXT,
    preferences TEXT,
    visibility VARCHAR(50) NOT NULL 
		CHECK (visibility IN ('public', 'private')) default 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- investors table
CREATE TABLE myadvisor.investors (
    investor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    net_worth varchar(100) check (net_worth in ('<50000', '50000-99999', '100000-199999', '200000-499999', '500000-999999', '1000000-4999999', '5000000-9999999',
     '10000000-49999999', '50000000-99999999', '100000000-499999999', '500000000-999999999', '>1000000000')),
    income_range VARCHAR(50) CHECK (income_range IN ('<25000', '25000-49999', '50000-74999', '75000-99999', '100000-149999', '150000-199999', '>200000')),
    geo_preferences VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- advisors table
CREATE TABLE myadvisor.advisors (
    advisor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    qualifications TEXT,
    expertise TEXT,
    office_address TEXT NOT NULL,
    operating_city_code TEXT NOT NULL,
    operating_country_code TEXT NOT NULL,
    contact_information TEXT,
    start_shift_1 TEXT NOT NULL,
    check (start_shift_1 in ('0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300')),
    end_shift_1 TEXT NOT NULL,
    check (end_shift_1 in ('0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300')),
    start_shift_2 TEXT,
    check (start_shift_2 in ('0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300')),
    end_shift_2 TEXT,
    check (end_shift_2 in ('0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300')),
    profile_views INT not null default 0,
    is_verified VARCHAR(1) not null default 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    img_url TEXT
);

-- [['retirement_planning', 'investment_management', 'tax_planning', 'estate_planning', 'insurance_planning', 
-- 'education_planning', 'debt_management', 'small_business_planning', 'divorce_planning', 'elder_care_planning', 
-- 'charitable_giving_and_philanthropy', 'behavioral_finance', 'wealth_management', 'risk_management', 'financial_education_and_coaching']]
            
CREATE TABLE myadvisor.service_types (
    service_id SERIAL PRIMARY KEY,
    service_type_name TEXT unique not null,
    service_type_code TEXT unique not null,
    is_active VARCHAR(1) not null default 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE myadvisor.advisor_service (
    advisor_id INT REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    service_id INT REFERENCES myadvisor.service_types(service_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (advisor_id, service_id)
);

CREATE TABLE myadvisor.investor_service (
    investor_id INT REFERENCES myadvisor.investors(investor_id) ON DELETE CASCADE,
    service_id INT REFERENCES myadvisor.service_types(service_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (investor_id, service_id)
);


-- Appointments table
CREATE TABLE myadvisor.appointments (
    appointment_id INT PRIMARY KEY DEFAULT nextval('myadvisor.appointment_id_seq'),
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    advisor_id INT REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_reviewed VARCHAR(1) NOT NULL DEFAULT 'N',
    status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Reviews table
CREATE TABLE myadvisor.reviews (
    review_id INT PRIMARY KEY DEFAULT nextval('myadvisor.review_id_seq'),
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    advisor_id INT REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE myadvisor.messages (
    message_id INT PRIMARY KEY DEFAULT nextval('myadvisor.message_id_seq'),
    sender_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    receiver_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Payments table (optional)
CREATE TABLE myadvisor.payments (
    payment_id INT PRIMARY KEY DEFAULT nextval('myadvisor.payment_id_seq'),
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    appointment_id INT REFERENCES myadvisor.appointments(appointment_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

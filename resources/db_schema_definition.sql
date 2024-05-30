
CREATE SEQUENCE appointment_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1;

CREATE SEQUENCE user_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE review_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE message_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1; 

CREATE SEQUENCE payment_id_seq
START WITH 1
INCREMENT BY 1
NO MINVALUE
NO MAXVALUE
CACHE 1

-- user_configs table
CREATE TABLE user_configs (
    user_id INT PRIMARY KEY DEFAULT nextval('user_id_seq'),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('investor', 'advisor', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
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
CREATE TABLE investors (
    investor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    net_worth varchar(100) check (net_worth in ('<50000', '50000-99999', '100000-199999', '200000-499999', '500000-999999', '1000000-4999999', '5000000-9999999',
     '10000000-49999999', '50000000-99999999', '100000000-499999999', '500000000-999999999', '>1000000000')),
    income_range VARCHAR(50) CHECK (income_range IN ('<25000', '25000-49999', '50000-74999', '75000-99999', '100000-149999', '150000-199999', '>200000')),
    geo_preferences VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- advisors table
CREATE TABLE advisors (
    advisor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    qualifications TEXT,
    expertise TEXT,
    office_address  NOT NULL TEXT,
    operating_city_code TEXT NOT NULL,
    operating_country_code TEXT NOT NULL,
    contact_information TEXT,
    start_shift_1 TIMESTAMP NOT NULL,
    end_shift_1 TIMESTAMP NOT NULL,
    start_shift_2 TIMESTAMP,
    end_shift_2 TIMESTAMP,
    profile_views INT not null default 0,
    is_verified VARCHAR(1) not null default 'N',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [['retirement_planning', 'investment_management', 'tax_planning', 'estate_planning', 'insurance_planning', 
-- 'education_planning', 'debt_management', 'small_business_planning', 'divorce_planning', 'elder_care_planning', 
-- 'charitable_giving_and_philanthropy', 'behavioral_finance', 'wealth_management', 'risk_management', 'financial_education_and_coaching']]
            
CREATE TABLE service_types (
    service_id SERIAL PRIMARY KEY,
    service_type_name TEXT unique not null,
    service_type_code TEXT unique not null,
    is_active VARCHAR(1) not null default 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE advisor_service (
    advisor_id INT REFERENCES advisors(advisor_id) ON DELETE CASCADE,
    service_id INT REFERENCES service_types(service_types) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (advisor_id, service_id)
);

CREATE TABLE investor_service (
    investor_id INT REFERENCES investors(investor_id) ON DELETE CASCADE,
    service_id INT REFERENCES service_types(service_types) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (investor_id, service_id)
);


-- Appointments table
CREATE TABLE appointments (
    appointment_id INT PRIMARY KEY DEFAULT nextval('appointment_id_seq'),
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    advisor_id INT REFERENCES advisors(advisor_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Reviews table
CREATE TABLE reviews (
    review_id INT PRIMARY KEY DEFAULT nextval('review_id_seq'),
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    advisor_id INT REFERENCES advisors(advisor_id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    message_id INT PRIMARY KEY DEFAULT nextval('message_id_seq'),
    sender_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    receiver_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Payments table (optional)
CREATE TABLE payments (
    payment_id INT PRIMARY KEY DEFAULT nextval('payment_id_seq'),
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

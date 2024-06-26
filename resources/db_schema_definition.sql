-- user_configs table
CREATE TABLE myadvisor.user_configs (
    user_id SERIAL PRIMARY KEY,
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
    display_name TEXT NOT NULL,
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

CREATE TABLE myadvisor.qualifications (
    qualification_id SERIAL PRIMARY KEY,
    qualification_name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL
);

INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Financial Planner', 'CFP');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Chartered Financial Analyst', 'CFA');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Public Accountant', 'CPA');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Investment Management Analyst', 'CIMA');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Fund Specialist', 'CFS');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Private Wealth Advisor', 'CPWA');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Chartered Life Underwriter', 'CLU');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Chartered Financial Consultant', 'ChFC');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Financial Risk Manager', 'FRM');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Accredited Asset Management Specialist', 'AAMS');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Series 6 License', 'Series 6');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Series 7 License', 'Series 7');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Series 65 License', 'Series 65');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Series 66 License', 'Series 66');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Trust and Fiduciary Advisor', 'CTFA');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Accredited Investment Fiduciary', 'AIF');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Retirement Income Certified Professional', 'RICP');
INSERT INTO  myadvisor.qualifications (qualification_name, abbreviation) VALUES ('Certified Retirement Counselor', 'CRC');


CREATE TABLE myadvisor.advisor_qualifications (
    advisor_id INT NOT NULL,
    qualification_id INT NOT NULL,
    PRIMARY KEY (advisor_id, qualification_id),
    FOREIGN KEY (advisor_id) REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    FOREIGN KEY (qualification_id) REFERENCES myadvisor.qualifications(qualification_id) ON DELETE CASCADE
);

              
CREATE TABLE myadvisor.service_types (
    service_id SERIAL PRIMARY KEY,
    service_type_name TEXT unique not null,
    service_type_code TEXT unique not null,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Retirement Planning', 'retirement_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Investment Management', 'investment_management');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Tax Planning', 'tax_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Estate Planning', 'estate_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Insurance Planning', 'insurance_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Education Planning', 'education_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Debt Management', 'debt_management');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Small Business Planning', 'small_business_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Divorce Planning', 'divorce_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Elder Care Planning', 'elder_care_planning');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Charitable Giving And Philanthropy', 'charitable_giving_and_philanthropy');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Behavioral Finance', 'behavioral_finance');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Wealth Management', 'wealth_management');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Risk Management', 'risk_management');
INSERT INTO myadvisor.service_types (service_type_name, service_type_code) VALUES ('Financial Education And Coaching', 'financial_education_and_coaching');
    
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
    appointment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    advisor_id INT REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    service_id INT REFERENCES myadvisor.service_types(service_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_reviewed BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Reviews table
CREATE TABLE myadvisor.reviews (
    review_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE SET NULL,
    advisor_id INT REFERENCES myadvisor.advisors(advisor_id) ON DELETE CASCADE,
    appointment_id INT REFERENCES myadvisor.appointments(appointment_id) ON DELETE SET NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_review UNIQUE (user_id, advisor_id, appointment_id)
);

-- Messages table
CREATE TABLE myadvisor.messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    receiver_id INT REFERENCES myadvisor.user_configs(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



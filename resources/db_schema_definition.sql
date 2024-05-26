
select * from user_configs uc ;
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
    financial_goals TEXT,
    visibility VARCHAR(50) NOT NULL 
		CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- advisors table
CREATE TABLE advisors (
    advisor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES user_configs(user_id) ON DELETE CASCADE,
    qualifications TEXT,
    expertise TEXT,
    services_offered TEXT,
    contact_information TEXT,
    start_shift_1 TIMESTAMP NOT NULL,
    end_shift_1 TIMESTAMP NOT NULL,
    start_shift_2 TIMESTAMP,
    end_shift_2 TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

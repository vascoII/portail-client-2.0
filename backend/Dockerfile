
FROM php:8.3-cli

LABEL maintainer="Techem Portail Client"

WORKDIR /var/www/backend

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    unzip \
    wget \
    libicu-dev \
    libzip-dev \
    libonig-dev \
    zlib1g-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libaio1 \
    libaio-dev && \
    docker-php-ext-configure intl && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j"$(nproc)" \
    intl \
    pdo_mysql \
    zip \
    opcache \
    soap \
    gd \
    mbstring && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

# Install Oracle Instant Client
RUN mkdir -p /opt/oracle && \
    cd /opt/oracle && \
    wget -q https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    unzip -q instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    rm -f instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    cd instantclient_21_1 && \
    rm -f *jdbc* *occi* *mysql* *README* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient_21_1 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Set Oracle environment variables
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/opt/oracle/instantclient_21_1

# Install PHP OCI8 extension via PECL
RUN pecl install oci8-3.2.0 && \
    docker-php-ext-enable oci8

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV APP_ENV=dev \
    COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MEMORY_LIMIT=-1 \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=1 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=20000

# Caching des vendors
COPY composer.json composer.lock ./
RUN composer install --prefer-dist --no-interaction --no-progress --no-scripts

# Code applicatif
COPY . .

# Exécuter les scripts post-install après avoir copié le code
RUN composer run-script post-install-cmd || true

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]

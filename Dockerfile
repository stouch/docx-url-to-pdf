FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive 
RUN apt update
RUN apt upgrade -y
RUN apt install -y curl gnupg2
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
RUN apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv-keys 83FBA1751378B444
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN echo "deb http://ppa.launchpad.net/libreoffice/libreoffice-7-5/ubuntu focal main" | tee /etc/apt/sources.list.d/libreoffice.list
# Signing key is here : https://launchpad.net/~libreoffice/+archive/ubuntu/libreoffice-7-5
#  then https://keyserver.ubuntu.com/pks/lookup?fingerprint=on&op=index&search=0xCDDE43BA4DE3F09D7CE7016673AEE920AD55F5A0
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 73AEE920AD55F5A0
RUN apt update
RUN apt install -y libreoffice
RUN apt install -y yarn
RUN apt install -y nodejs

RUN mkdir /tmp/generated_pdfs
RUN mkdir /tmp/uploaded_docx
RUN mkdir /tmp/libreoffice_profiles
RUN mkdir /docx-url-to-pdf
WORKDIR /docx-url-to-pdf

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY ./src ./src
# Copy all the fonts as some might be missing from the default installation
ADD ./fonts /usr/share/fonts 

ENV CLEANUP_AUTOMATION_DRY_MODE=OFF
ENV CLEANUP_AUTOMATION_INTERVAL_MS=50000
ENV PORT=9999
ENV FILE_MAX_AGE_IN_SECONDS=300
ENTRYPOINT ["yarn", "start:production"]
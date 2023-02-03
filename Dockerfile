FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive 
RUN apt update
RUN apt upgrade -y
RUN apt install -y curl gnupg2
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
RUN apt-key adv --keyserver hkps://keyserver.ubuntu.com --recv-keys 83FBA1751378B444
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN echo "deb http://ppa.launchpad.net/libreoffice/libreoffice-7-0/ubuntu focal main" | tee /etc/apt/sources.list.d/libreoffice.list
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